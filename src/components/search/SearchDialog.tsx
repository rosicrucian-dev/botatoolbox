'use client'

// Search dialog: a HeadlessUI combobox over the static title index in
// lib/search (substring match — see there). Default-exported so
// next/dynamic in Search.tsx can lazy-load the dialog chunk on first use.
// The dialog frame itself is SearchDialogShell, shared with the full-text
// CollectionSearchDialog.

import { ComboboxOption, ComboboxOptions } from '@headlessui/react'
import clsx from 'clsx'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useLocaleRouter } from '@/components/locale/LocaleLink'
import { useLocale } from '@/components/locale/LocaleProvider'
import { useNavData } from '@/components/nav/NavProvider'
import { SearchDialogShell } from '@/components/search/SearchDialogShell'
import { useT } from '@/content/messages/useT'
import { getSearchEntries, searchTitles, type SearchEntry } from '@/lib/search'

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
  const sectionTitle = useNavData()?.groups.find((group) =>
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
    <SearchDialogShell
      open={open}
      onClose={close}
      className={className}
      onSelect={(entry: SearchEntry) => {
        router.push(entry.url)
        onNavigate()
        close()
      }}
      query={query}
      onQueryChange={setQuery}
      placeholder={t('search.find')}
      ariaLabel={t('search.label')}
    >
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
    </SearchDialogShell>
  )
}
