'use client'

// Generic section-scoped full-text search dialog. Same HeadlessUI combobox
// shell as the global SearchDialog, but backed by a prebuilt index from the
// shared search engine (src/lib/search-engine) instead of the title index:
// results are whole items ranked phrase-first then by relevance, each showing
// the passage it matched, and open the target page AT that passage (`#p<n>`)
// with the words marked (`?q=`). Parameterized by the index URL and copy so one
// component serves recordings and any future searchable collection.
// Kept separate from lib/search so the global title search is untouched.
// The dialog frame itself is SearchDialogShell, shared with SearchDialog.

import { ComboboxOption, ComboboxOptions } from '@headlessui/react'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLocaleRouter } from '@/components/locale/LocaleLink'
import { SearchDialogShell } from '@/components/search/SearchDialogShell'
import { useT } from '@/content/messages/useT'
import {
  snippetUrl,
  type RecordingsIndex,
  type RecordingsResult,
  type SearchTrackMeta,
} from '@/lib/collectionSearch'
import {
  highlight,
  IndexFormatError,
  parseQuery,
  search,
  type Part,
  type Query,
} from '@/lib/search-engine'
import { useSearchIndex } from '@/lib/search-engine/react/use-search-index'
import { useSectionTexts } from '@/lib/search-engine/react/use-section-texts'
import { useChunkedLimit } from '@/lib/use-chunked-limit'

/**
 * How many results get an excerpt AT A TIME. EVERY match is listed; these pay
 * for their section-text fetch (~11 KB gzipped each), and scrolling toward the
 * end reveals another chunk (see useChunkedLimit). So this is the bandwidth-vs-
 * detail dial, not a ceiling — set it to 0 to turn excerpts off entirely.
 *
 * A session can never exceed the whole corpus (2.3 MB gzipped), which the
 * service worker then keeps. Same number in agelesswisdom's dialog.
 */
const SNIPPET_ROWS = 25

/** About how many characters of the matched paragraph to show. */
const EXCERPT_CHARS = 190

// Mark the query words in a title, using the engine's definition of a hit
// rather than a raw substring — so "tree life" marks both words in "Tree of
// Life", which a substring match misses entirely. Only the emphasis is this
// project's; agelesswisdom's dialog marks its titles with the same call.
function HighlightQuery({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((part, i) =>
        part.hit ? (
          <span key={i} className="text-emerald-500 underline">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}

/** Marked runs of excerpt text, emphasising the matched words. */
function Marked({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((part, i) =>
        part.hit ? (
          <mark
            key={i}
            className="bg-transparent font-semibold text-zinc-900 dark:text-zinc-200"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}

function ResultRow({
  index,
  query,
  result,
  excerpt,
}: {
  index: RecordingsIndex
  query: Query
  result: RecordingsResult
  excerpt: Part[] | null
}) {
  // A single-word query has no phrase to speak of (`phrase` equals `count`), so
  // only a multi-word query can be a phrase match.
  const isPhrase = query.terms.length > 1 && result.phrase > 0
  const n = isPhrase ? result.phrase : result.count
  return (
    <ComboboxOption
      as="li"
      value={result}
      className={clsx(
        'group block cursor-default px-4 py-2',
        'data-focus:bg-zinc-900/5 dark:data-focus:bg-white/5',
      )}
    >
      {/* Title, source and count share ONE line, with the excerpt beneath —
          same row shape as agelesswisdom's dialog. Readers move between the two
          sites, so the layout is deliberately identical and only the palette
          differs. It also keeps rows short, which matters now that every match
          is listed. */}
      <span className="flex items-baseline gap-x-3">
        <span className="min-w-0 flex-auto truncate text-sm/6 text-zinc-900 group-data-focus:text-emerald-500 dark:text-white">
          <HighlightQuery parts={highlight(index, result.title, query)} />
        </span>
        {result.meta?.subtitle ? (
          <span className="min-w-0 shrink truncate text-xs/6 text-zinc-500 dark:text-zinc-400">
            {result.meta.subtitle}
          </span>
        ) : null}
        {/* Occurrences of the PHRASE when the query occurs as one, else of the
            query's words added together. `phrase || count` looked equivalent
            and was not: a result with no phrase match fell through to its
            scattered total, which can be the LARGER number, so a non-match
            could outrank the look of a real one. The title says which. */}
        <span
          title={
            isPhrase
              ? `${n} occurrences of that exact phrase`
              : `${n} mentions, scattered through the transcript`
          }
          className="w-10 shrink-0 text-right text-xs/6 text-zinc-400 tabular-nums dark:text-zinc-500"
        >
          {n}&times;
        </span>
      </span>
      {excerpt ? (
        <span className="mt-0.5 line-clamp-2 text-xs/5 text-zinc-500 dark:text-zinc-400">
          <Marked parts={excerpt} />
        </span>
      ) : null}
    </ComboboxOption>
  )
}

export default function CollectionSearchDialog({
  open,
  setOpen,
  indexUrl,
  placeholder,
  nounPlural,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  /** URL of the prebuilt index JSON to fetch and query. */
  indexUrl: string
  /** Input placeholder, e.g. "Search transcripts…". */
  placeholder: string
  /** Plural noun for the empty/loading copy, e.g. "transcripts". */
  nounPlural: string
}) {
  const router = useLocaleRouter()
  const { t } = useT()
  const [text, setText] = useState('')
  const pathname = usePathname()
  const { status, index, error, retry } =
    useSearchIndex<SearchTrackMeta>(indexUrl)

  // Close on navigation — but NOT on the initial mount. This dialog is
  // lazy-mounted on the first "Search" click, so a mount-time setOpen(false)
  // would slam it shut the instant it opened (the bug: first click flashed).
  // Skip the first run; only close when the pathname actually changes.
  const didMount = useRef(false)
  useEffect(() => {
    if (didMount.current) setOpen(false)
    else didMount.current = true
  }, [pathname, setOpen])

  // Parse once per keystroke with the index's own tokenizer; every row reuses it.
  const query = useMemo(
    () => (index ? parseQuery(index, text) : null),
    [index, text],
  )

  // Rank everything, then show a page of it: with 211 transcripts a common term
  // matches most of the archive ("tarot" hits 173), and showing ten of those
  // silently reads as "there are ten". Ranking 211 docs costs nothing.
  // Every match is shown; only the first SNIPPET_ROWS pay for an excerpt.
  //
  // Memoized on the query, NOT because one search is expensive but because this
  // component re-renders once per arriving section file — ~25 times per query —
  // and an unmemoized search re-ranked the whole archive on every one of them.
  const results = useMemo(
    () => (index && query && query.terms.length ? search(index, query) : []),
    [index, query],
  )

  // Excerpts follow the reader down the list a chunk at a time, so someone who
  // flicks to the bottom doesn't land among rows with no passage shown.
  const { limit: excerptRows, onScroll } = useChunkedLimit(
    SNIPPET_ROWS,
    results.length,
    text,
  )
  // The index's content stamp rides on every section-text URL so a deploy
  // invalidates them; see snippetUrl.
  const stamp = index?.stamp
  const sectionUrls = useMemo(
    () => results.slice(0, excerptRows).map((r) => snippetUrl(r.id, stamp)),
    [results, excerptRows, stamp],
  )
  const sectionTexts = useSectionTexts(sectionUrls)

  // Which paragraph to show: the one the result links to — `best.section`, the
  // first phrase hit, else the rarest word's. For a title-only hit, the opening.
  // Done once per (results, texts) rather than per row per render: this
  // component re-renders on each of the ~25 section-file arrivals.
  const excerptFor = useMemo(() => {
    const byId = new Map<string, Part[]>()
    if (!index || !query) return byId
    for (const result of results.slice(0, excerptRows)) {
      const texts = sectionTexts.get(snippetUrl(result.id, stamp))
      if (!texts?.length) continue
      const section =
        result.best.where === 'body' ? (result.best.section ?? 0) : 0
      const passage = texts[section] ?? texts[0]
      byId.set(
        result.id,
        highlight(index, passage, query, { window: EXCERPT_CHARS }),
      )
    }
    return byId
  }, [index, query, results, excerptRows, sectionTexts, stamp])

  function close() {
    setOpen(false)
    setText('')
  }

  return (
    <SearchDialogShell
      open={open}
      onClose={close}
      onSelect={(result: RecordingsResult) => {
        if (!result.meta) return
        // Two slots, two jobs: the FRAGMENT deep-links to the paragraph the
        // result matched (`#p12`, which the transcript page scrolls to and cues
        // the audio from), and the QUERY STRING carries the words so the page
        // can mark them (see use-mark-query). They don't compete.
        const section =
          result.best.where === 'body' ? result.best.section : undefined
        const hash = section === undefined ? '' : `#p${section}`
        router.push(
          `${result.meta.href}?q=${encodeURIComponent(text.trim())}${hash}`,
        )
        close()
      }}
      query={text}
      onQueryChange={setText}
      placeholder={placeholder}
      ariaLabel={t('search.label')}
    >
      {status === 'loading' ? (
        <p className="p-6 text-center text-xs text-zinc-500">
          Loading {nounPlural}…
        </p>
      ) : status === 'error' && error instanceof IndexFormatError ? (
        // A stale service worker served last deploy's index to new code.
        // Retrying would fetch the same cached file; a reload lets the new
        // worker take over and fetch the fresh one.
        <div className="p-6 text-center">
          <p className="text-xs text-zinc-700 dark:text-zinc-400">
            Search was updated.{' '}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-semibold text-emerald-500 underline"
            >
              Reload the page
            </button>{' '}
            to use it.
          </p>
        </div>
      ) : status === 'error' ? (
        <div className="p-6 text-center">
          <p className="text-xs text-zinc-700 dark:text-zinc-400">
            Couldn’t load the search index.{' '}
            <button
              type="button"
              onClick={retry}
              className="font-semibold text-emerald-500 underline"
            >
              Retry
            </button>
          </p>
        </div>
      ) : results.length === 0 ? (
        <p className="p-6 text-center text-xs text-zinc-700 dark:text-zinc-400">
          No {nounPlural} mention{' '}
          <strong className="font-semibold text-zinc-900 dark:text-white">
            ‘{text.trim().replace(/["“”]/g, '')}’
          </strong>
          .
        </p>
      ) : (
        <ComboboxOptions
          static
          as="ul"
          onScroll={onScroll}
          className="max-h-88 overflow-y-auto py-2"
        >
          {index && query
            ? results.map((result) => (
                <ResultRow
                  key={result.id}
                  index={index}
                  query={query}
                  result={result}
                  excerpt={excerptFor.get(result.id) ?? null}
                />
              ))
            : null}
        </ComboboxOptions>
      )}
    </SearchDialogShell>
  )
}
