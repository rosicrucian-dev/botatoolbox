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

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { CollectionSearchIndexSchema } from '../src/content/data/schemas.ts'
import type { SearchTrack } from '../src/lib/collection-search.ts'
import {
  buildInvertedIndex,
  stripMarkdown,
  type IndexItem,
} from './lib/build-search-index.ts'

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

const manifest: ManifestRow[] = JSON.parse(readFileSync(MANIFEST, 'utf8'))

const items: IndexItem[] = manifest.map((r) => {
  const track: SearchTrack = {
    id: r.slug,
    title: r.title,
    subtitle: r.grouping,
    href: `/recordings/${r.groupingSlug}/${r.slug}`,
  }
  const body = readFileSync(join(BODY_DIR, `${r.slug}.md`), 'utf8')
  // Index the title too, so a title-only word is findable.
  return { track, text: `${r.title} ${stripMarkdown(body)}` }
})

const index = buildInvertedIndex(items)
CollectionSearchIndexSchema.parse(index)

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(index))

const bytes = readFileSync(OUT).length
console.log(
  `Wrote search index: ${index.tracks.length} recordings, ` +
    `${Object.keys(index.words).length} unique words, ` +
    `${(bytes / 1024).toFixed(0)} KB → ${OUT.replace(ROOT + '/', '')}`,
)
