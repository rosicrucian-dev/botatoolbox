import { PageHeading } from '@/components/layout/PageHeading'
import { Link } from '@/components/locale/LocaleLink'
import { Children, Fragment, type ReactNode } from 'react'

// The title row every view of a tool carries: the TOOL's name, an
// optional action, and the tab links. The heading names the tool and
// not the view because the active tab already says which view this is
// — two words for one fact read as a stutter.
//
// Tabs are real navigation (next/link), so the active one is decided by
// the route and a bookmark names the view (src/lib/tools.ts).
export function ToolLayout({
  title,
  tabs,
  active,
  action,
  children,
}: {
  title: string
  tabs: ReadonlyArray<{ href: string; label: string }>
  /** The href of the view being shown. */
  active: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <article className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <PageHeading truncate>{title}</PageHeading>
        <div className="flex items-center gap-2">
          {action}
          <Tabs>
            {tabs.map((tab) => (
              <Tab key={tab.href} href={tab.href} active={tab.href === active}>
                {tab.label}
              </Tab>
            ))}
          </Tabs>
        </div>
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
