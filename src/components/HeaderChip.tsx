'use client'

import { type ReactNode } from 'react'

// Shared base for the chip-style buttons in player headers and toolbar
// rows (Flow, Compass, Close). Owns the geometry, ring, and
// pressed/hover states; consumers supply behavior and contents. Uses
// current-color rings and hovers so the chip adapts to whatever
// foreground color its parent sets — no theme branching needed.
//
// `pressed` is optional. When provided, the chip behaves as an aria
// toggle and shows a subtle fill in the on state. When omitted (e.g.
// for the Close button) the chip is a plain action button with only a
// hover state — no aria-pressed attribute is emitted.
export function HeaderChip({
  pressed,
  onClick,
  ariaLabel,
  title,
  children,
}: {
  pressed?: boolean
  onClick: () => void
  ariaLabel?: string
  title?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      title={title}
      className={
        'relative inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap ring-1 ring-current/20 transition ' +
        (pressed ? 'bg-current/15' : 'hover:bg-current/10')
      }
    >
      {children}
    </button>
  )
}
