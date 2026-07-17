'use client'

// Search dialog: a HeadlessUI combobox over the static title index in
// lib/search (substring match — see there). Default-exported so
// next/dynamic in Search.tsx can lazy-load the dialog chunk on first use.

import { useLocaleRouter } from '@/components/LocaleLink'
import { useT } from '@/content/messages/useT'
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
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useLocale } from '@/components/LocaleProvider'
import { getNavigation } from '@/lib/nav'
import { getSearchEntries, searchTitles, type SearchEntry } from '@/lib/search'

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

function NoResultsIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.01 12a4.237 4.237 0 0 0 1.24-3c0-.62-.132-1.207-.37-1.738M12.01 12A4.237 4.237 0 0 1 9 13.25c-.635 0-1.237-.14-1.777-.388M12.01 12l3.24 3.25m-3.715-9.661a4.25 4.25 0 0 0-5.975 5.908M4.5 15.5l11-11"
      />
    </svg>
  )
}

// Wraps the matched substring in the emerald underline treatment the old
// highlighter used.
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

function SearchOption({
  entry,
  index,
  query,
}: {
  entry: SearchEntry
  index: number
  query: string
}) {
  // Breadcrumb: the nav group this page lives under (detail pages like a
  // single tarot card aren't nav-listed and just show their title).
  const locale = useLocale()
  const sectionTitle = getNavigation(locale).find((group) =>
    group.links.some((link) => link.href === entry.url),
  )?.title

  return (
    <ComboboxOption
      as="li"
      value={entry}
      className={clsx(
        'group block cursor-default px-4 py-3 data-focus:bg-zinc-50 dark:data-focus:bg-zinc-800/50',
        index > 0 && 'border-t border-zinc-100 dark:border-zinc-800',
      )}
    >
      <div className="text-sm font-medium text-zinc-900 group-data-focus:text-emerald-500 dark:text-white">
        <HighlightQuery text={entry.title} query={query} />
      </div>
      {sectionTitle && (
        <div className="mt-1 truncate text-2xs whitespace-nowrap text-zinc-500">
          {sectionTitle}
        </div>
      )}
    </ComboboxOption>
  )
}

export default function SearchDialog({
  open,
  setOpen,
  className,
  onNavigate = () => {},
}: {
  open: boolean
  setOpen: (open: boolean) => void
  className?: string
  onNavigate?: () => void
}) {
  const router = useLocaleRouter()
  const locale = useLocale()
  const { t } = useT()
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setOpen(false)
  }, [pathname, searchParams, setOpen])

  const results = searchTitles(query, 8, getSearchEntries(locale))

  function close() {
    setOpen(false)
    setQuery('')
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      className={clsx('fixed inset-0 z-50', className)}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-400/25 backdrop-blur-xs data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-black/40"
      />

      <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 lg:px-8 lg:py-[15vh]">
        <DialogPanel
          transition
          // In a standalone home-screen app the viewport starts at the
          // physical screen top, so without this the panel's phone
          // position (py-4 above) puts the input under the Dynamic
          // Island — a blurred screen with no visible field. The inset
          // is 0 in browsers (their chrome owns that zone), so this
          // only moves the panel where it's actually occluded.
          style={{ marginTop: 'env(safe-area-inset-top)' }}
          className="mx-auto transform-gpu overflow-hidden rounded-lg bg-zinc-50 shadow-xl ring-1 ring-zinc-900/7.5 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:max-w-xl dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <Combobox
            onChange={(entry: SearchEntry | null) => {
              if (!entry) return
              router.push(entry.url)
              onNavigate()
              close()
            }}
          >
            <div className="group relative flex h-12">
              <SearchIcon className="pointer-events-none absolute top-0 left-3 h-full w-5 stroke-zinc-500" />
              <ComboboxInput
                autoFocus
                placeholder={t('search.find')}
                aria-label={t('search.label')}
                displayValue={() => query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex-auto appearance-none bg-transparent pr-4 pl-10 text-zinc-900 outline-hidden placeholder:text-zinc-500 sm:text-sm dark:text-white"
              />
            </div>
            {query.trim() !== '' && (
              <div className="border-t border-zinc-200 bg-white dark:border-zinc-100/5 dark:bg-white/2.5">
                {results.length === 0 ? (
                  <div className="p-6 text-center">
                    <NoResultsIcon className="mx-auto h-5 w-5 stroke-zinc-900 dark:stroke-zinc-600" />
                    <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-400">
                      {t('search.nothingFoundBefore')}{' '}
                      <strong className="font-semibold wrap-break-word text-zinc-900 dark:text-white">
                        &lsquo;{query}&rsquo;
                      </strong>
                      {t('search.nothingFoundAfter')}
                    </p>
                  </div>
                ) : (
                  <ComboboxOptions static as="ul">
                    {results.map((entry, index) => (
                      <SearchOption
                        key={entry.url}
                        entry={entry}
                        index={index}
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
