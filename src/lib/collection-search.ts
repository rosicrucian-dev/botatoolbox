// botatoolbox's adapter over the shared search-engine. The engine (tokenizer,
// positional index, phrase + BM25 ranking) lives in ./search-engine and is kept
// identical with agelesswisdom; this file is the project-local part: the
// document type, the English-bound query, and the per-URL index fetch.

import {
  searchIndex as engineSearch,
  type SearchIndex,
  type SearchResult,
} from './search-engine.ts'

export { tokenize } from './search-engine.ts'

/** A searchable item, such as a recording transcript. */
export interface SearchTrack {
  /** Stable identity, used as the React key. */
  id: string
  title: string
  /** Optional secondary line under the title (e.g. a grouping). */
  subtitle?: string
  /** Route href to the result page. */
  href: string
}

export type CollectionSearchIndex = SearchIndex<SearchTrack> & {
  /** Content stamp of this build's snippet sidecars — see `snippetUrl`. */
  version?: string
}
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

// Fetching + caching an index lives in the shared use-search-index hook, which
// is generic over the index type and keyed by URL for exactly this reason.

/**
 * URL of a track's snippet sidecar — its paragraphs, parallel to the ones the
 * transcript page renders (see scripts/gen-recordings-search.ts).
 *
 * `version` is the index's content stamp. Sidecars live at stable paths and are
 * cached hard by the service worker, so the stamp is what makes a deploy
 * invalidate them: new transcripts → new stamp → new URL → a miss. Omitting it
 * is harmless (the URL still resolves) but leaves the reader on cached text.
 */
export function snippetUrl(doc: SearchTrack, version?: string): string {
  return `/data/recordings-snippets/${doc.id}.json${version ? `?v=${version}` : ''}`
}
