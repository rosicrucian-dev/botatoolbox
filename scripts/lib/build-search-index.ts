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

// Build a positional inverted index: for each word, per item it records the
// item index, its occurrence count, then every position in the item's
// (stopword-removed) token stream — encoded flat as
//   words[word] = [itemIdx, count, p0, p1, …, itemIdx2, count2, …]
// Positions let the query rank exact phrases ("Builders of the Adytum" =
// `builders` immediately followed by `adytum`) above scattered word hits.
export function buildInvertedIndex(items: IndexItem[]): CollectionSearchIndex {
  const tracks = items.map((i) => i.track)
  const words: Record<string, number[]> = {}
  items.forEach((item, idx) => {
    const positions = new Map<string, number[]>()
    tokenize(item.text).forEach((w, pos) => {
      const arr = positions.get(w)
      if (arr) arr.push(pos)
      else positions.set(w, [pos])
    })
    for (const [w, pos] of positions) (words[w] ??= []).push(idx, pos.length, ...pos)
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
