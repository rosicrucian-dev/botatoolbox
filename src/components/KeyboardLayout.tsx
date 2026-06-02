import { Children, Fragment, type ReactNode } from 'react'
import Link from 'next/link'

// Title row + tab links shared by /keyboard, /keyboard/piano, and
// /keyboard/tableau. Tabs are real navigation (next/link), so the active
// tab is determined by route, not state.
export function KeyboardLayout({
  tab,
  children,
}: {
  tab: 'piano' | 'tableau'
  children: ReactNode
}) {
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Keyboard
        </h1>
        <Tabs>
          <Tab href="/keyboard/tableau" active={tab === 'tableau'}>
            Tableau
          </Tab>
          <Tab href="/keyboard/piano" active={tab === 'piano'}>
            Piano
          </Tab>
        </Tabs>
      </div>
      {children}
    </article>
  )
}

// Segmented-control container. Dividers are explicit sibling elements
// (not `divide-x` border-left) so they sit on the page background rather
// than on top of the active tab's tinted fill — keeps the inner divider
// at the same visual weight as the outer ring regardless of which tab
// is active.
function Tabs({ children }: { children: ReactNode }) {
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

function Tab({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        'inline-flex h-full items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition ' +
        (active ? 'bg-current/15' : 'hover:bg-current/10')
      }
    >
      {children}
    </Link>
  )
}
