'use client'

import { Children, Fragment, type ReactNode } from 'react'

// Segmented-control container — extracted from OpenDrawClient so
// other views (Tree-of-Life flow direction, etc.) can reuse the
// same look. Adapts to current-color so it picks up the surrounding
// theme without explicit dark-mode classes.
export function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children)
  return (
    <div className="inline-flex h-9 overflow-hidden rounded-md ring-1 ring-current/20">
      {tabs.map((tab, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true" className="w-px bg-current/20" />}
          {tab}
        </Fragment>
      ))}
    </div>
  )
}

export function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'inline-flex h-full items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition ' +
        (active ? 'bg-current/15' : 'hover:bg-current/10')
      }
    >
      {children}
    </button>
  )
}
