import Link from 'next/link'

// Title row + tab links shared by /keyboard, /keyboard/piano, and
// /keyboard/tableau. Tabs are real navigation (next/link), so the active
// tab is determined by route, not state.
export function KeyboardLayout({
  tab,
  children,
}: {
  tab: 'piano' | 'tableau'
  children: React.ReactNode
}) {
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Keyboard
        </h1>
        <div className="flex gap-1">
          <TabLink href="/keyboard/tableau" active={tab === 'tableau'}>
            Tableau
          </TabLink>
          <TabLink href="/keyboard/piano" active={tab === 'piano'}>
            Piano
          </TabLink>
        </div>
      </div>
      {children}
    </article>
  )
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        'inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap ring-1 ring-current/20 transition ' +
        (active ? 'bg-current/15' : 'hover:bg-current/10')
      }
    >
      {children}
    </Link>
  )
}
