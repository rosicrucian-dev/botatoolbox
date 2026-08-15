'use client'

// Generic section-scoped full-text search dialog. Same HeadlessUI combobox
// shell as the global SearchDialog, but backed by a prebuilt inverted index
// (src/lib/collection-search) instead of the title index — results are whole
// items ranked by how often the query appears, and open the target page with
// the term highlighted (?q=…). Parameterized by the index URL and copy so one
// component serves recordings and any future searchable collection.
// Kept separate from lib/search so the global title search is untouched.

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useT } from '@/content/messages/useT'
import {
  searchIndex,
  snippetUrl,
  tokenize,
  type CollectionSearchIndex,
  type CollectionSearchResult,
} from '@/lib/collection-search'
import {
  highlightParts,
  matchRanges,
  snippetParts,
  type SnippetPart,
} from '@/lib/search-engine'
import { useChunkedLimit } from '@/lib/use-chunked-limit'
import { useSearchIndex } from '@/lib/use-search-index'
import { useSnippets } from '@/lib/use-snippets'

/**
 * How many results get a snippet AT A TIME. EVERY match is listed; these pay
 * for their sidecar fetch (~11 KB gzipped each), and scrolling toward the end
 * reveals another chunk (see useChunkedLimit). So this is the bandwidth-vs-
 * detail dial, not a ceiling — set it to 0 to turn snippets off entirely.
 *
 * A session can never exceed the whole corpus (2.3 MB gzipped), which the
 * service worker then keeps. Same number in agelesswisdom's dialog.
 */
const SNIPPET_ROWS = 25

function SearchIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.01 12a4.25 4.25 0 1 0-6.02-6 4.25 4.25 0 0 0 6.02 6Zm0 0 3.24 3.25"
      />
    </svg>
  )
}

// Mark the query words in a title, using the engine's definition of a hit
// rather than a raw substring — so "tree life" marks both words in "Tree of
// Life", which a substring match misses entirely. `highlightParts` is the
// shared splitter (agelesswisdom's dialog marks its titles with the same call);
// only the emphasis below is this project's.
function HighlightQuery({ text, tokens }: { text: string; tokens: string[] }) {
  return (
    <>
      {highlightParts(text, tokens).map((part, i) =>
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

/** Marked runs of snippet text, emphasising the matched words. */
function Marked({ parts }: { parts: SnippetPart[] }) {
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
  result,
  tokens,
  isMultiWord,
  snippet,
}: {
  result: CollectionSearchResult
  tokens: string[]
  /** Whether the query has 2+ searchable words, so `phrase` is meaningful. */
  isMultiWord: boolean
  snippet: SnippetPart[] | null
}) {
  // A single-word query has no phrase to speak of (`phrase` equals `count`), so
  // only a multi-word query can be a phrase match.
  const isPhrase = isMultiWord && result.phrase > 0
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
      {/* Title, source and count share ONE line, with the snippet beneath —
          same row shape as agelesswisdom's dialog. Readers move between the two
          sites, so the layout is deliberately identical and only the palette
          differs. It also keeps rows short, which matters now that every match
          is listed. */}
      <span className="flex items-baseline gap-x-3">
        <span className="min-w-0 flex-auto truncate text-sm/6 text-zinc-900 group-data-focus:text-emerald-500 dark:text-white">
          <HighlightQuery text={result.doc.title} tokens={tokens} />
        </span>
        {result.doc.subtitle ? (
          <span className="min-w-0 shrink truncate text-xs/6 text-zinc-500 dark:text-zinc-400">
            {result.doc.subtitle}
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
      {snippet ? (
        <span className="mt-0.5 line-clamp-2 text-xs/5 text-zinc-500 dark:text-zinc-400">
          <Marked parts={snippet} />
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
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const { status, index, retry } =
    useSearchIndex<CollectionSearchIndex>(indexUrl)

  // Close on navigation — but NOT on the initial mount. This dialog is
  // lazy-mounted on the first "Search" click, so a mount-time setOpen(false)
  // would slam it shut the instant it opened (the bug: first click flashed).
  // Skip the first run; only close when the pathname actually changes.
  const didMount = useRef(false)
  useEffect(() => {
    if (didMount.current) setOpen(false)
    else didMount.current = true
  }, [pathname, setOpen])

  // Rank everything, then show a page of it: with 211 transcripts a common term
  // matches most of the archive ("tarot" hits 173), and showing ten of those
  // silently reads as "there are ten". Ranking 211 docs costs nothing.
  // Every match is shown; only the first SNIPPET_ROWS pay for a sidecar.
  //
  // Memoized on the query, NOT because one search is expensive but because this
  // component re-renders once per arriving sidecar — ~25 times per query — and
  // an unmemoized search re-ranked the whole archive on every one of them.
  const results = useMemo(
    () =>
      index && query.trim()
        ? searchIndex(index, query, Number.MAX_SAFE_INTEGER)
        : [],
    [index, query],
  )
  const tokens = useMemo(() => tokenize(query), [query])
  const isMultiWord = tokens.length > 1
  // Snippets follow the reader down the list a chunk at a time, so someone who
  // flicks to the bottom doesn't land among rows with no passage shown.
  const { limit: snippetRows, onScroll } = useChunkedLimit(
    SNIPPET_ROWS,
    results.length,
    query,
  )
  // The index's content stamp rides on every sidecar URL so a deploy
  // invalidates them; see snippetUrl.
  const version = index?.version
  const snippetUrls = useMemo(
    () => results.slice(0, snippetRows).map((r) => snippetUrl(r.doc, version)),
    [results, snippetRows, version],
  )
  const snippets = useSnippets(snippetUrls)

  // Which paragraph to show: the first that actually contains a match. This
  // index carries no per-paragraph positions (unlike agelesswisdom's block
  // spans, which exist there to build a deep link) and doesn't need to — the
  // sidecar is already in hand, so scanning it beats carrying the offsets.
  //
  // Done once per (results, snippets) rather than per row per render: the scan
  // is a regex over every paragraph of every shown transcript, and re-running
  // it for all 25 rows on each of the ~25 sidecar arrivals was the single most
  // expensive thing this dialog did.
  const snippetFor = useMemo(() => {
    const byId = new Map<string, SnippetPart[]>()
    for (const result of results.slice(0, snippetRows)) {
      const blocks = snippets.get(snippetUrl(result.doc, version))
      if (!blocks?.length) continue
      const hit = blocks.find((b: string) => matchRanges(b, tokens).length > 0)
      byId.set(result.doc.id, snippetParts(hit ?? blocks[0], tokens))
    }
    return byId
  }, [results, snippetRows, snippets, tokens, version])

  function close() {
    setOpen(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onClose={close} className="fixed inset-0 z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-900/25 backdrop-blur-xs data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-black/40"
      />
      <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 lg:px-8 lg:py-[15vh]">
        <DialogPanel
          transition
          style={{ marginTop: 'env(safe-area-inset-top)' }}
          className="mx-auto transform-gpu overflow-hidden rounded-lg bg-white shadow-xl ring ring-zinc-900/10 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:max-w-xl dark:bg-zinc-900 dark:ring-white/10"
        >
          <Combobox
            onChange={(result: CollectionSearchResult | null) => {
              if (!result) return
              // ?q= drives the on-page highlight (phrase-first — see
              // use-highlight-query), so the destination marks the actual
              // phrase and scrolls to it, rather than every scattered
              // "of"/"the". The QUERY STRING, not the fragment: that leaves the
              // fragment free for a deep link, which is how the sibling project
              // uses it.
              router.push(
                `${result.doc.href}?q=${encodeURIComponent(query.trim())}`,
              )
              close()
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <SearchIcon className="size-5 shrink-0 stroke-zinc-500 dark:stroke-zinc-400" />
              <ComboboxInput
                autoFocus
                placeholder={placeholder}
                aria-label={t('search.label')}
                displayValue={() => query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex-auto appearance-none bg-transparent text-base/6 text-zinc-900 outline-hidden placeholder:text-zinc-500 sm:text-sm/6 dark:text-white"
              />
            </div>
            {query.trim() !== '' && (
              <div className="border-t border-zinc-900/10 dark:border-white/10">
                {status === 'loading' ? (
                  <p className="p-6 text-center text-xs text-zinc-500">
                    Loading {nounPlural}…
                  </p>
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
                      ‘{query}’
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
                    {results.map((result) => (
                      <ResultRow
                        key={result.doc.id}
                        result={result}
                        tokens={tokens}
                        isMultiWord={isMultiWord}
                        snippet={snippetFor.get(result.doc.id) ?? null}
                      />
                    ))}
                  </ComboboxOptions>
                )}
              </div>
            )}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
