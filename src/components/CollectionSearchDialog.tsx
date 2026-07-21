'use client'

// Generic section-scoped full-text search dialog. Same HeadlessUI combobox
// shell as the global SearchDialog, but backed by a prebuilt inverted index
// (src/lib/collection-search) instead of the title index — results are whole
// items ranked by how often the query appears, and open the target page with
// the term highlighted (#q=…). Parameterized by the index URL and copy so one
// component serves recordings, the Book of Tokens, and any future collection.
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
import { useEffect, useRef, useState } from 'react'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useT } from '@/content/messages/useT'
import {
  searchIndex,
  type CollectionSearchResult,
} from '@/lib/collection-search'
import { useSearchIndex } from '@/lib/useSearchIndex'

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

function HighlightQuery({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (at === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span className="text-emerald-500 underline">
        {text.slice(at, at + q.length)}
      </span>
      {text.slice(at + q.length)}
    </>
  )
}

function ResultRow({
  result,
  index,
  query,
}: {
  result: CollectionSearchResult
  index: number
  query: string
}) {
  return (
    <ComboboxOption
      as="li"
      value={result}
      className={clsx(
        'group flex cursor-default items-center justify-between gap-3 px-4 py-3 data-focus:bg-zinc-50 dark:data-focus:bg-zinc-800/50',
        index > 0 && 'border-t border-zinc-100 dark:border-zinc-800',
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-zinc-900 group-data-focus:text-emerald-500 dark:text-white">
          <HighlightQuery text={result.track.title} query={query} />
        </div>
        {result.track.subtitle ? (
          <div className="mt-1 truncate text-2xs whitespace-nowrap text-zinc-500">
            {result.track.subtitle}
          </div>
        ) : null}
      </div>
      {/* Phrase-match count when the query occurs as a phrase, else total
          word occurrences. */}
      <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-2xs tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {result.phrase || result.count}
      </span>
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
  const { status, index, retry } = useSearchIndex(indexUrl)

  // Close on navigation — but NOT on the initial mount. This dialog is
  // lazy-mounted on the first "Search" click, so a mount-time setOpen(false)
  // would slam it shut the instant it opened (the bug: first click flashed).
  // Skip the first run; only close when the pathname actually changes.
  const didMount = useRef(false)
  useEffect(() => {
    if (didMount.current) setOpen(false)
    else didMount.current = true
  }, [pathname, setOpen])

  const results = index && query.trim() ? searchIndex(index, query, 10) : []

  function close() {
    setOpen(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onClose={close} className="fixed inset-0 z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-400/25 backdrop-blur-xs data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-black/40"
      />
      <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 lg:px-8 lg:py-[15vh]">
        <DialogPanel
          transition
          style={{ marginTop: 'env(safe-area-inset-top)' }}
          className="mx-auto transform-gpu overflow-hidden rounded-lg bg-zinc-50 shadow-xl ring-1 ring-zinc-900/7.5 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:max-w-xl dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <Combobox
            onChange={(result: CollectionSearchResult | null) => {
              if (!result) return
              // On-page term highlighting is off for now — multi-word queries
              // lit up every "of"/"the". Navigate without the #q= fragment so
              // useHighlightQuery finds nothing; readers can Ctrl-F instead.
              // (Re-enable by appending `#q=${encodeURIComponent(query.trim())}`.)
              router.push(result.track.href)
              close()
            }}
          >
            <div className="group relative flex h-12">
              <SearchIcon className="pointer-events-none absolute top-0 left-3 h-full w-5 stroke-zinc-500" />
              <ComboboxInput
                autoFocus
                placeholder={placeholder}
                aria-label={t('search.label')}
                displayValue={() => query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex-auto appearance-none bg-transparent pr-4 pl-10 text-zinc-900 outline-hidden placeholder:text-zinc-500 sm:text-sm dark:text-white"
              />
            </div>
            {query.trim() !== '' && (
              <div className="border-t border-zinc-200 bg-white dark:border-zinc-100/5 dark:bg-white/2.5">
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
                  <ComboboxOptions static as="ul">
                    {results.map((result, i) => (
                      <ResultRow
                        key={result.track.id}
                        result={result}
                        index={i}
                        query={query}
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
