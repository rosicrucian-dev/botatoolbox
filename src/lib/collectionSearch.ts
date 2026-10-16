// botatoolbox's adapter over the shared search engine (src/lib/search-engine).
// The engine knows documents, sections, an index and results; this file is the
// project-local part: what a recording carries as `meta`, where its section
// texts live, and what an arrived-at page needs to mark the words.
//
// Scripts import this by relative path under --experimental-strip-types, so it
// uses no `@` aliases.

import type { SearchIndex, SearchResult } from './search-engine/index.ts'
import type { TokenizerConfig } from './search-engine/tokenizer.ts'

/** What a recording result carries back from the index. */
export interface SearchTrackMeta {
  /** Secondary line under the title: the recording's grouping. */
  subtitle?: string
  /** Route href to the recording page. */
  href: string
}

export type RecordingsIndex = SearchIndex<SearchTrackMeta>
export type RecordingsResult = SearchResult<SearchTrackMeta>

/**
 * How the recordings index is tokenized — used by the generator to build it and
 * by the transcript page to mark a result's words on arrival (which has no
 * index in hand). botatoolbox content is English (the `de` copy is an English
 * placeholder); revisit once real German content lands.
 */
export const RECORDINGS_TOKENIZER: TokenizerConfig = { locale: 'en' }

/** The mark on an arrived-at page's matched words. */
export const SEARCH_MARK_CLASS =
  'rounded-sm bg-amber-200/70 text-inherit dark:bg-amber-400/30'

/**
 * URL of a recording's section texts — its paragraphs, parallel to the ones the
 * transcript page renders (see scripts/gen-recordings-search.ts).
 *
 * `stamp` is the index's content stamp. The files live at stable paths and are
 * cached hard by the service worker, so the stamp is what makes a deploy
 * invalidate them: new transcripts → new stamp → new URL → a miss. Omitting it
 * is harmless (the URL still resolves) but leaves the reader on cached text.
 */
export function snippetUrl(id: string, stamp?: string): string {
  return `/data/recordings-snippets/${id}.json${stamp ? `?v=${stamp}` : ''}`
}
