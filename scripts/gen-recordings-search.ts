// Build public/data/recordings-search.json — the recordings full-text search
// index — and one section-text file per recording beside it.
//
//   npm run gen:search:recordings   (run after gen:recordings)
//
// Reads the recordings manifest (content/data/recordings.json) for track
// metadata and each transcript body (content/recordings/en/<slug>.md). A
// recording is one document: its title, and its paragraphs as the sections —
// the SAME paragraphs the transcript page renders (src/lib/transcriptParagraphs),
// so a result's section index is a `#p<n>` deep link and the paragraph the
// audio timings are keyed by. Built with the shared engine's buildIndex, which
// records how it tokenized so the dialog can never query differently.
//
// Shipped as static /public files and fetched on demand (like
// gematria-words.json), not bundled. The section texts are kept out of the
// index: together they are the whole 6.6 MB corpus, and every reader downloads
// the index merely to type. The dialog fetches only the rows it shows.
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import {
  RECORDINGS_TOKENIZER,
  type SearchTrackMeta,
} from '../src/lib/collectionSearch.ts'
import {
  buildIndex,
  loadIndex,
  type SearchDocument,
} from '../src/lib/search-engine/index.ts'
import { splitParagraphs } from '../src/lib/transcriptParagraphs.ts'

const ROOT = resolve(import.meta.dirname, '..')
const MANIFEST = join(ROOT, 'content/data/recordings.json')
const BODY_DIR = join(ROOT, 'content/recordings/en')
const TIMINGS = join(ROOT, 'content/data/recordings-timings.json')
const OUT = join(ROOT, 'public/data/recordings-search.json')
const SECTIONS_DIR = join(ROOT, 'public/data/recordings-snippets')

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

/** Strip markdown mechanics so markup never pollutes the word list or an
 *  excerpt. The transcripts are plain prose with the odd emphasis or link. */
function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/\[\^[^\]]*\]:?/g, ' ') // footnote refs/defs
    .replace(/<[^>]+>/g, ' ') // HTML tags
    .replace(/[#>*_`~]/g, ' ') // heading/emphasis/code marks
}

// Paragraph index is the join between the transcript, its audio start times and
// where a search result lands. Nothing here consumes it directly — but if a
// body is edited after its timings were built, the counts stop matching and the
// page silently drops to the non-interactive transcript: no click-to-seek, and
// a search result can no longer cue the audio. Silent degradation is the thing
// worth catching, so say it loudly while we already have every body open.
const drifted: string[] = []

const docs: SearchDocument<SearchTrackMeta>[] = manifest.map((r) => {
  const body = readFileSync(join(BODY_DIR, `${r.slug}.md`), 'utf8')
  const paragraphs = splitParagraphs(body)
  const starts = timings[r.slug]
  if (starts && paragraphs.length !== starts.length) {
    drifted.push(
      `${r.slug} (${paragraphs.length} paragraphs vs ${starts.length} timings)`,
    )
  }
  return {
    id: r.slug,
    title: r.title,
    meta: {
      subtitle: r.grouping,
      href: `/recordings/${r.groupingSlug}/${r.slug}`,
    },
    // No anchors: the section INDEX is the paragraph number, and the transcript
    // page already answers to `#p<n>`.
    sections: paragraphs.map((p) => ({ text: stripMarkdown(p) })),
  }
})

const { index, sections } = buildIndex(docs, {
  tokenizer: RECORDINGS_TOKENIZER,
})

mkdirSync(SECTIONS_DIR, { recursive: true })
let sectionBytes = 0
for (const [id, texts] of Object.entries(sections)) {
  const json = JSON.stringify(texts)
  writeFileSync(join(SECTIONS_DIR, `${id}.json`), json)
  sectionBytes += Buffer.byteLength(json)
}

// A round trip through JSON and loadIndex proves the file on disk is one the
// dialog will accept, before it is written.
const json = JSON.stringify(index)
loadIndex(JSON.parse(json))
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, json)

console.log(
  `Wrote search index: ${index.docs.length} recordings, ` +
    `${index.terms.length} unique words, ` +
    `${(Buffer.byteLength(json) / 1024).toFixed(0)} KB → ${OUT.replace(ROOT + '/', '')}`,
)
console.log(
  `Wrote section texts: ${manifest.length} recordings, ` +
    `${(sectionBytes / 1024 / 1024).toFixed(1)} MB total, ` +
    `${(sectionBytes / 1024 / manifest.length).toFixed(0)} KB average → ` +
    `${SECTIONS_DIR.replace(ROOT + '/', '')}/`,
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
