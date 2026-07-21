// Shared inverted-index builder for every collection search generator
// (gen-recordings-search, gen-book-of-tokens-search, …). Tokenizes each item's
// text with the SAME tokenize() the client queries with (src/lib/
// collection-search) so the index and queries can never drift.
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import {
  tokenize,
  type CollectionSearchIndex,
  type SearchTrack,
} from '../../src/lib/collection-search.ts'

export interface IndexItem {
  track: SearchTrack
  /** Full text to index for this item (include the title so title-only
   *  words are findable). */
  text: string
}

/** Build a { tracks, words } inverted index from items in list order. */
export function buildInvertedIndex(items: IndexItem[]): CollectionSearchIndex {
  const tracks = items.map((i) => i.track)
  const words: Record<string, number[]> = {}
  items.forEach((item, idx) => {
    const counts = new Map<string, number>()
    for (const w of tokenize(item.text)) {
      counts.set(w, (counts.get(w) ?? 0) + 1)
    }
    for (const [w, c] of counts) (words[w] ??= []).push(idx, c)
  })
  return { tracks, words }
}

/** Strip residual markdown mechanics so markup never pollutes the word list. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/[#>*_`~]/g, ' ') // heading/emphasis/code marks
}
