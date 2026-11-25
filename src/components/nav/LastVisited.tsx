'use client'

import { useT } from '@/content/messages/useT'
// Deliberate raw next/link: the chip restores the exact stored pathname,
// locale prefix and all. Routing it through the locale-aware Link would
// re-prefix a stored English path when the chip renders on /de/,
// sending the user to the other locale's copy of where they left off.
// eslint-disable-next-line no-restricted-imports
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useSyncExternalStore } from 'react'

// "Continue where you left off." An installed home-screen app always
// relaunches at `/`, no matter where the user was studying — so the
// tracker (mounted globally in providers.tsx) records the last visited
// page in localStorage, and the chip (rendered on the home page) offers
// a one-tap jump back to it.

const KEY = 'last-visited-v1'

interface LastVisited {
  path: string
  title: string
}

function TrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Home is the launch point, not a study destination.
    if (pathname === '/') return
    // Wait a beat for the App Router to commit the new document.title.
    const timer = setTimeout(() => {
      const title = document.title.replace(/ - BOTA Toolbox$/, '')
      // A missing/utility title means a 404 or similar — don't record it.
      if (!title || title === 'BOTA Toolbox') return
      const search = searchParams.toString()
      const entry: LastVisited = {
        path: search ? `${pathname}?${search}` : pathname,
        title,
      }
      try {
        localStorage.setItem(KEY, JSON.stringify(entry))
      } catch {}
    }, 100)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return null
}

// useSearchParams requires a Suspense boundary during static export.
export function LastVisitedTracker() {
  return (
    <Suspense>
      <TrackerInner />
    </Suspense>
  )
}

function subscribeToStorage(callback: () => void) {
  // Fired for changes from other tabs; same-tab writes happen on other
  // routes, so by the time the home page renders the value is current.
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function ContinueChip() {
  const { t } = useT()
  // useSyncExternalStore reads localStorage hydration-safely: the server
  // snapshot is null (chip absent in the static HTML), the client
  // snapshot fills in after hydration.
  const raw = useSyncExternalStore(
    subscribeToStorage,
    () => {
      try {
        return localStorage.getItem(KEY)
      } catch {
        return null
      }
    },
    () => null,
  )

  const last = useMemo<LastVisited | null>(() => {
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Partial<LastVisited>
      if (
        typeof parsed.path === 'string' &&
        parsed.path.startsWith('/') &&
        typeof parsed.title === 'string' &&
        parsed.title
      ) {
        return { path: parsed.path, title: parsed.title }
      }
    } catch {}
    return null
  }, [raw])

  if (!last) return null
  return (
    // lg:hidden — resume-where-I-left-off is a phone/installed-app
    // affordance (the home-screen app always relaunches at /); on
    // desktop the sidebar + history make it redundant.
    <Link
      href={last.path}
      className="inline-flex min-w-0 items-center gap-2 rounded-full bg-emerald-50 py-1.5 pr-4 pl-3 text-sm font-medium text-emerald-600 ring-1 ring-emerald-600/20 transition hover:bg-emerald-100 lg:hidden dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/30 dark:hover:bg-emerald-500/20"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
        <path
          fillRule="evenodd"
          d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z"
          clipRule="evenodd"
        />
      </svg>
      {/* Truncates so a long page title can't overflow the heading row on
          a narrow phone — the heading keeps its width, the chip gives. */}
      <span className="truncate">
        {t('lastVisited.continue')} {last.title}
      </span>
    </Link>
  )
}
