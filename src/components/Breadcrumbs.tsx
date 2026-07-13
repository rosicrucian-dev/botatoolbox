'use client'

import clsx from 'clsx'
import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { navigation } from '@/lib/nav'

// Breadcrumb trail for the top bar, ported from the Compass template and
// adapted to the toolbox's shared Header. A page declares its trail by
// rendering <SetBreadcrumbs items={…} />; the Header reads it from context
// and renders <BreadcrumbTrail />. Pages that set nothing show no trail
// (the Header falls back to the logo) — breadcrumbs are never forced.

export interface Crumb {
  label: string
  /** Omit on the current (last) page. */
  href?: string
  /** Rendered muted and non-interactive — used for the collapsed "…". */
  muted?: boolean
}

// The stored trail is tagged with the pathname it was set for. The Header
// only renders it when that tag matches the live pathname, so a trail left
// over from the previous page is ignored the instant the route changes —
// no unmount-order races, and unlabeled pages fall back to the logo.
interface Entry {
  path: string
  items: Array<Crumb>
}

const BreadcrumbContext = createContext<{
  entry: Entry
  setEntry: (e: Entry) => void
}>({ entry: { path: '', items: [] }, setEntry: () => {} })

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [entry, setEntry] = useState<Entry>({ path: '', items: [] })
  return (
    <BreadcrumbContext.Provider value={{ entry, setEntry }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

/** Declare the current page's breadcrumb trail (leaf last, no href). */
export function SetBreadcrumbs({ items }: { items: Array<Crumb> }) {
  const { setEntry } = useContext(BreadcrumbContext)
  const pathname = usePathname()
  const key = JSON.stringify(items)
  useEffect(() => {
    setEntry({ path: pathname, items })
  }, [pathname, key, setEntry])
  return null
}

/** The live trail for the current route, or [] if the page set none. */
export function useBreadcrumbs(): Array<Crumb> {
  const { entry } = useContext(BreadcrumbContext)
  const pathname = usePathname()
  return useMemo(
    () => (entry.path === pathname ? entry.items : []),
    [entry, pathname],
  )
}

// Every page sits under a sidebar group (Tarot, Reference, Devices, …),
// and every group now has a landing page at `/<group>` (lowercased title).
// Map each top-level route segment to its group so the trail can link the
// group crumb to that page. Two kinds of segment map to a group:
//   - a member's first segment (`/tarot/the-fool` → tarot → Tarot; for a
//     flat group this is the short canonical URL, `/cube-of-space` →
//     Devices; for a nested group it equals the group slug, `/practice/quiz`
//     → practice → Practice), and
//   - the group's own slug (`/devices` → Devices), which also covers a flat
//     group's grouped alias (`/devices/cube-of-space` → Devices).
const GROUP_BY_SEGMENT: Record<string, string> = {}
for (const group of navigation) {
  const slug = group.title.toLowerCase()
  if (!(slug in GROUP_BY_SEGMENT)) GROUP_BY_SEGMENT[slug] = group.title
  for (const link of group.links) {
    const seg = link.href.split('/')[1]
    if (seg && !(seg in GROUP_BY_SEGMENT)) GROUP_BY_SEGMENT[seg] = group.title
  }
}

// Groups whose crumb is intentionally suppressed: their member pages show
// just `Home / <Leaf>` (e.g. `Home / About`), not `Home / Website / About`.
// The group's own landing page (/website) still shows `Home / Website` via
// its items — only the derived parent crumb is dropped.
const HIDE_GROUP_CRUMB = new Set(['Website'])

function groupForPath(
  pathname: string,
): { title: string; href: string } | null {
  const title = GROUP_BY_SEGMENT[pathname.split('/')[1] ?? '']
  if (!title || HIDE_GROUP_CRUMB.has(title)) return null
  return { title, href: `/${title.toLowerCase()}` }
}

function Separator() {
  // shrink-0 so the slash keeps its own width (and the gap-x-2 on either
  // side) even when the trail is tight — it must never get squeezed onto a
  // neighbouring label.
  return (
    <span className="shrink-0 text-zinc-900/25 dark:text-white/25">/</span>
  )
}

// A single crumb. `truncate` (only used on the leaf) must sit on a block-level
// element — overflow:hidden is a no-op on inline elements, which is what let a
// shrunk label spill past its box and jam the next "/".
function Crumb({
  crumb,
  current,
  truncate,
}: {
  crumb: Crumb
  current: boolean
  truncate?: boolean
}) {
  const color =
    crumb.muted || current
      ? 'text-zinc-500 dark:text-zinc-400'
      : 'text-zinc-900 dark:text-white'
  const cls = clsx(truncate ? 'block truncate' : 'block whitespace-nowrap', color)
  return crumb.href && !current ? (
    <Link href={crumb.href} className={cls}>
      {crumb.label}
    </Link>
  ) : (
    <span className={cls}>{crumb.label}</span>
  )
}

// Renders "Home / <Group> / …items". Home links to /; the group crumb links
// to that group's landing page (dropped when we're already on it — the group
// page's own leaf comes through `items`).
//
// Sizing is pure CSS — the full trail shows whenever it fits, with NO
// measurement. Every ancestor crumb is shrink-0 (kept intact, since home /
// group / parent are the "go back up" targets), and only the LEAF may shrink
// and ellipsis ("The Fo…") when the bar is too narrow. So it only ever
// truncates when there genuinely isn't room, and it's always the far-right
// detail that gives way (which is also the page's <h1>).
export function BreadcrumbTrail({ items }: { items: Array<Crumb> }) {
  const pathname = usePathname()
  // trailingSlash: true means usePathname() returns "/devices/", so compare
  // against the group href with any trailing slash stripped (but keep "/").
  const normalized = pathname.replace(/(.)\/$/, '$1')
  const group = groupForPath(pathname)
  const onGroupPage = group ? normalized === group.href : false
  const isHome = normalized === '/'
  // On the home page the leaf IS home, so show a single "Home" crumb (from
  // items) with no duplicated root prefix. Everywhere else, prepend the
  // "Home" root (and the group crumb) ahead of the page's own items.
  const trail: Array<Crumb> = isHome
    ? items
    : [
        { label: 'Home', href: '/' },
        ...(group && !onGroupPage
          ? [{ label: group.title, href: group.href }]
          : []),
        ...items,
      ]

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex w-full min-w-0 items-center gap-x-2 overflow-hidden text-sm/6"
    >
      {trail.map((crumb, i) => {
        const first = i === 0
        const last = i === trail.length - 1
        return (
          <Fragment key={i}>
            {!first && <Separator />}
            {/* Only the leaf shrinks (min-w-0 + truncate); ancestors stay at
                natural width so the trail collapses from the right only. */}
            <span className={last ? 'min-w-0' : 'shrink-0'}>
              <Crumb crumb={crumb} current={last} truncate={last} />
            </span>
          </Fragment>
        )
      })}
    </nav>
  )
}
