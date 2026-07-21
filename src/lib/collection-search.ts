// botatoolbox's adapter over the shared search-engine. The engine (tokenizer,
// positional index, phrase + BM25 ranking) lives in ./search-engine and is kept
// identical with agelesswisdom; this file is the project-local part: the
// document type, the English-bound query, and the per-URL index fetch.

import {
  searchIndex as engineSearch,
  type SearchIndex,
  type SearchResult,
} from '@/lib/search-engine'

export { tokenize } from '@/lib/search-engine'

/** A searchable item (recording transcript, Book of Tokens meditation, …). */
export interface SearchTrack {
  /** Stable identity, used as the React key. */
  id: string
  title: string
  /** Optional secondary line under the title (e.g. a grouping). */
  subtitle?: string
  /** Route href to the result page. */
  href: string
}

export type CollectionSearchIndex = SearchIndex<SearchTrack>
export type CollectionSearchResult = SearchResult<SearchTrack>

/**
 * Query a collection index. botatoolbox content is English (the `de` copy is an
 * English placeholder), so both index and query use English stopwords — revisit
 * the locale argument once real German content lands.
 */
export function searchIndex(
  index: CollectionSearchIndex,
  query: string,
  limit = 12,
): CollectionSearchResult[] {
  return engineSearch(index, query, 'en', limit)
}

// Fetch a (non-bundled) index once and cache the promise per URL for the
// session, so distinct collections don't clobber each other's cache.
const cache = new Map<string, Promise<CollectionSearchIndex>>()
export function fetchIndex(url: string): Promise<CollectionSearchIndex> {
  let promise = cache.get(url)
  if (!promise) {
    promise = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`search index ${url}: HTTP ${r.status}`)
        return r.json() as Promise<CollectionSearchIndex>
      })
      .catch((err) => {
        cache.delete(url) // don't cache a failure — allow retry
        throw err
      })
    cache.set(url, promise)
  }
  return promise
}
