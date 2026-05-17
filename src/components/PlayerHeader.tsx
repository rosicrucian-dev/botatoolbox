'use client'

import { HeaderChip } from '@/components/HeaderChip'

// Shared chrome header for full-bleed player views: SlidePlayer (meditation
// slides) and the Cube of Space expand view. Title on the left, optional
// `extraHeaderItem` slot (e.g. SoundButton, FlowToggle) and a chip-styled
// close button on the right. All chips adapt to the slide's text color
// via current-color rings/hovers — no theme branching needed.
export function PlayerHeader({
  title,
  onClose,
  extraHeaderItem,
}: {
  title: string
  onClose: () => void
  extraHeaderItem?: React.ReactNode
}) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <span className="truncate font-semibold">{title}</span>
      <div className="flex items-center gap-2">
        {extraHeaderItem}
        <HeaderChip onClick={onClose} ariaLabel="Close">
          {/* Expanded touch target on coarse-pointer (touch) devices —
              same trick the template's Header buttons use. */}
          <span className="absolute size-12 pointer-fine:hidden" />
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </HeaderChip>
      </div>
    </header>
  )
}
