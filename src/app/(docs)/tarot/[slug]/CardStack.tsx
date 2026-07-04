'use client'

import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { type ReactNode } from 'react'

import { HeaderChip } from '@/components/HeaderChip'
import { usePersistedToggle } from '@/lib/usePersistedToggle'

// Two-column card-detail layout (details left, image right) that collapses
// to a single stack on narrow screens — with a persisted toggle for
// whether the image lands ABOVE or BELOW the details when stacked. The
// arrows chip renders only while collapsed (side-by-side columns have no
// stacking order to flip). Deliberately not surfaced in Settings: it's a
// reading-order preference you flip right where you notice it.
//
// Shared by MajorCard and MinorCard; server-rendered content flows in
// through the slots, only the toggle lives on the client.

const IMAGE_FIRST_KEY = 'bota:tarot-image-first'

export function CardStack({
  header,
  actions,
  meta,
  image,
}: {
  // Page title, left side of the header row.
  header: ReactNode
  // Buttons on the right of the header row (e.g. the Focus play link).
  // The stack-order chip is inserted to their left automatically.
  actions?: ReactNode
  meta: ReactNode
  image: ReactNode
}) {
  const [imageFirst, setImageFirst] = usePersistedToggle(IMAGE_FIRST_KEY, false)
  return (
    // One grid, two shapes: a single ordered column when collapsed; on md+
    // the details take rows 1–2 of the left track and the image spans both
    // rows of the right track (≈2/5 wide, capped like max-w-sm).
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-[minmax(0,1fr)_minmax(0,min(40%,24rem))] md:items-start">
      <div className="flex items-start justify-between gap-4 md:col-start-1 md:row-start-1">
        {header}
        <div className="flex shrink-0 items-center gap-2 text-zinc-900 dark:text-white">
          <span className="md:hidden">
            {/* Plain action chip (no `pressed`): this swaps the order
                rather than switching something on, so it shouldn't show
                an on-state fill. */}
            <HeaderChip
              onClick={() => setImageFirst((v) => !v)}
              ariaLabel={
                imageFirst
                  ? 'Show the card image below the details'
                  : 'Show the card image above the details'
              }
            >
              <ArrowsUpDownIcon className="h-5 w-5" />
            </HeaderChip>
          </span>
          {actions}
        </div>
      </div>
      <div
        className={clsx(
          'md:col-start-1 md:row-start-2',
          imageFirst && 'max-md:order-2',
        )}
      >
        {meta}
      </div>
      <div
        className={clsx(
          'md:col-start-2 md:row-span-2 md:row-start-1',
          imageFirst && 'max-md:order-1',
        )}
      >
        {image}
      </div>
    </div>
  )
}
