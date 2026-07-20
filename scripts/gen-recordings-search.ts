// Build public/data/recordings-search.json — the recordings-scoped full-text
// search index (word → [trackIdx, count, …]).
//
//   npm run gen:search   (run after gen:recordings)
//
// Reads the recordings manifest (content/data/recordings.json) for track
// metadata and each transcript body (content/recordings/en/<slug>.md), then
// tokenizes with the SAME tokenizer the client queries with (src/lib/
// recordings-search.ts) so the index and queries can't drift. Shipped as a
// static /public file and fetched on demand (like gematria-words.json), not
// bundled.
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { RecordingsSearchIndexSchema } from '../src/content/data/schemas.ts'
import {
  tokenize,
  type RecordingsSearchIndex,
  type SearchTrack,
} from '../src/lib/recordings-search.ts'

const ROOT = resolve(import.meta.dirname, '..')
const MANIFEST = join(ROOT, 'content/data/recordings.json')
const BODY_DIR = join(ROOT, 'content/recordings/en')
const OUT = join(ROOT, 'public/data/recordings-search.json')

interface ManifestRow {
  slug: string
  title: string
  grouping: string
  groupingSlug: string
}

// Transcript bodies are plain paragraphs, but strip any residual markdown
// mechanics so link targets / markup never pollute the word list.
function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/[#>*_`~]/g, ' ') // heading/emphasis/code marks
}

const manifest: ManifestRow[] = JSON.parse(readFileSync(MANIFEST, 'utf8'))

const tracks: SearchTrack[] = manifest.map((r) => ({
  slug: r.slug,
  title: r.title,
  grouping: r.grouping,
  href: `/recordings/${r.groupingSlug}/${r.slug}`,
}))

const words: Record<string, number[]> = {}
let totalTokens = 0
manifest.forEach((r, idx) => {
  const body = readFileSync(join(BODY_DIR, `${r.slug}.md`), 'utf8')
  // Index the title too, so a title-only word is findable.
  const counts = new Map<string, number>()
  for (const w of tokenize(`${r.title} ${stripMarkdown(body)}`)) {
    counts.set(w, (counts.get(w) ?? 0) + 1)
  }
  for (const [w, c] of counts) (words[w] ??= []).push(idx, c)
  totalTokens += counts.size
})

const index: RecordingsSearchIndex = { tracks, words }
RecordingsSearchIndexSchema.parse(index)

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(index))

const bytes = readFileSync(OUT).length
console.log(
  `Wrote search index: ${tracks.length} recordings, ` +
    `${Object.keys(words).length} unique words, ` +
    `${(bytes / 1024).toFixed(0)} KB → ${OUT.replace(ROOT + '/', '')}`,
)
