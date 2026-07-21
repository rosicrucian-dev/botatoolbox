'use client'

// A page toolbar's Search action: an emerald button (matching the site's
// primaryAction convention, e.g. the Timer page) that opens a section-scoped
// full-text search dialog. The dialog (and its index fetch) is lazy-loaded and
// only mounted on first open, so visiting the page doesn't download the index
// until the user actually searches. Parameterized by index URL + copy so
// recordings, the Book of Tokens, and future collections share one component.

import dynamic from 'next/dynamic'
import { useState } from 'react'

const CollectionSearchDialog = dynamic(
  () => import('./CollectionSearchDialog'),
  { ssr: false },
)

function SearchIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12.01 12a4.25 4.25 0 1 0-6.02-6 4.25 4.25 0 0 0 6.02 6Zm0 0 3.24 3.25"
      />
    </svg>
  )
}

export function CollectionSearch({
  indexUrl,
  placeholder,
  nounPlural,
  label = 'Search',
}: {
  indexUrl: string
  placeholder: string
  nounPlural: string
  /** Button label; defaults to "Search". */
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMounted(true)
          setOpen(true)
        }}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-400"
      >
        <SearchIcon className="h-4 w-4 stroke-white" />
        {label}
      </button>
      {mounted && (
        <CollectionSearchDialog
          open={open}
          setOpen={setOpen}
          indexUrl={indexUrl}
          placeholder={placeholder}
          nounPlural={nounPlural}
        />
      )}
    </>
  )
}
