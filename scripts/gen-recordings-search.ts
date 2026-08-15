// Build public/data/recordings-search.json — the recordings-scoped full-text
// search index (word → [trackIdx, count, …]).
//
//   npm run gen:search:recordings   (run after gen:recordings)
//
// Reads the recordings manifest (content/data/recordings.json) for track
// metadata and each transcript body (content/recordings/en/<slug>.md), then
// builds the index with the shared buildInvertedIndex helper — which tokenizes
// with the SAME tokenizer the client queries with (src/lib/collection-search)
// so the index and queries can't drift. Shipped as a static /public file and
// fetched on demand (like gematria-words.json), not bundled.
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { CollectionSearchIndexSchema } from '../src/content/data/schemas.ts'
import type { SearchTrack } from '../src/lib/collection-search.ts'
import { buildInvertedIndex, stripMarkdown } from '../src/lib/search-engine.ts'
import { splitParagraphs } from '../src/lib/transcript-paragraphs.ts'

const ROOT = resolve(import.meta.dirname, '..')
const MANIFEST = join(ROOT, 'content/data/recordings.json')
const BODY_DIR = join(ROOT, 'content/recordings/en')
const TIMINGS = join(ROOT, 'content/data/recordings-timings.json')
const OUT = join(ROOT, 'public/data/recordings-search.json')
// One sidecar per recording: its paragraphs, for the search dialog's snippets.
// Kept OUT of the index — this is the whole 6.6 MB corpus, and every reader
// downloads the index merely to type. The dialog fetches only the rows it shows.
const SNIPPET_DIR = join(ROOT, 'public/data/recordings-snippets')

interface ManifestRow {
  slug: string
  title: string
  grouping: string
  groupingSlug: string
}

const manifest: ManifestRow[] = JSON.parse(readFileSync(MANIFEST, 'utf8'))
const timings: Record<string, number[]> = JSON.parse(
  readFileSync(TIMINGS, 'utf8'),
)

// Paragraph index is the join between the transcript, its audio start times and
// where a search result lands. Nothing here consumes it directly — but if a
// body is edited after its timings were built, the counts stop matching and the
// page silently drops to the non-interactive transcript: no click-to-seek, and
// a search result can no longer cue the audio. Silent degradation is the thing
// worth catching, so say it loudly while we already have every body open.
const drifted: string[] = []
let snippetBytes = 0
mkdirSync(SNIPPET_DIR, { recursive: true })

// Content hash of every sidecar, which becomes the `?v=` on their URLs. The
// sidecars sit at stable paths and are cached hard by the service worker
// (they can't change within a deploy), so without the stamp a reader could be
// served last deploy's paragraphs indefinitely.
const version = createHash('sha256')

const items = manifest.map((r) => {
  const doc: SearchTrack = {
    id: r.slug,
    title: r.title,
    subtitle: r.grouping,
    href: `/recordings/${r.groupingSlug}/${r.slug}`,
  }
  const body = readFileSync(join(BODY_DIR, `${r.slug}.md`), 'utf8')
  const paragraphs = splitParagraphs(body)
  const starts = timings[r.slug]
  if (starts && paragraphs.length !== starts.length) {
    drifted.push(
      `${r.slug} (${paragraphs.length} paragraphs vs ${starts.length} timings)`,
    )
  }
  // Parallel to the paragraphs the page renders, so a paragraph index means
  // the same thing to the transcript, its audio timings and a search snippet.
  const sidecar = JSON.stringify(paragraphs.map((p) => p.replace(/\s+/g, ' ')))
  writeFileSync(join(SNIPPET_DIR, `${r.slug}.json`), sidecar)
  snippetBytes += Buffer.byteLength(sidecar)
  version.update(sidecar)
  // Index the title too, so a title-only word is findable.
  return { doc, text: `${r.title} ${stripMarkdown(body)}` }
})

const index = {
  ...buildInvertedIndex(items, 'en'),
  // Rides in the index because the dialog already has the index in hand when it
  // builds a sidecar URL — no second manifest to fetch.
  version: version.digest('hex').slice(0, 12),
}
CollectionSearchIndexSchema.parse(index)

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(index))

const bytes = readFileSync(OUT).length
console.log(
  `Wrote search index: ${index.docs.length} recordings, ` +
    `${Object.keys(index.words).length} unique words, ` +
    `${(bytes / 1024).toFixed(0)} KB → ${OUT.replace(ROOT + '/', '')}`,
)
console.log(
  `Wrote snippet sidecars: ${manifest.length} recordings, ` +
    `${(snippetBytes / 1024 / 1024).toFixed(1)} MB total, ` +
    `${(snippetBytes / 1024 / manifest.length).toFixed(0)} KB average → ` +
    `${SNIPPET_DIR.replace(ROOT + '/', '')}/`,
)

if (drifted.length) {
  console.warn(
    `\n⚠ ${drifted.length} recording(s) no longer match their timings — ` +
      `click-to-seek and search cueing are OFF for these until\n` +
      `  npm run gen:recordings:timings <slug>  is re-run:\n` +
      drifted.map((d) => `    ${d}`).join('\n') +
      '\n',
  )
}
