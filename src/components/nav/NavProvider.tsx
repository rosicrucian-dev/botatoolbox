'use client'

import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { useLocaleRouter } from '@/components/locale/LocaleLink'
import { useLocale } from '@/components/locale/LocaleProvider'
import { tKey } from '@/content/messages'
import { stripLocale } from '@/lib/locales'
import type { NavGroup } from '@/lib/nav'

// Client-side access to the localized navigation, supplied by the (docs)
// server layout — mirroring LocaleProvider. The nav is assembled from
// the content manifests in lib/nav.ts (server-only); passing it through
// context keeps those datasets out of the client bundle while every
// chrome component (sidebar, breadcrumbs, search, pins) still reads the
// same structure it did when it called getNavigation() directly.

export interface NavData {
  // Localized nav, hidden links included (consumers filter as needed).
  groups: ReadonlyArray<NavGroup>
  // English display title → localized title (getNavTitleMap, serialized).
  titleMap: Record<string, string>
}

const NavContext = createContext<NavData | null>(null)

export function NavProvider({
  nav,
  refreshPrivateNav = false,
  children,
}: {
  nav: NavData
  refreshPrivateNav?: boolean
  children: React.ReactNode
}) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useLocaleRouter()
  const [snapshot, setSnapshot] = useState({ initial: nav, current: nav })
  const liveNav = snapshot.initial === nav ? snapshot.current : nav

  useEffect(() => {
    if (!refreshPrivateNav) return
    let active = true
    let busy = false
    let previousRevision: string | null = null
    const poll = async () => {
      if (busy) return
      busy = true
      try {
        const response = await fetch(`/${locale}/private/manifest`, {
          cache: 'no-store',
        })
        if (!response.ok || !active) return
        const result = (await response.json()) as {
          nav: NavData
          revision: string
        }
        if (!active) return
        if (previousRevision !== result.revision) {
          setSnapshot({ initial: nav, current: result.nav })
        }
        if (
          previousRevision !== null &&
          previousRevision !== result.revision &&
          stripLocale(pathname).path.startsWith('/private/')
        ) {
          router.refresh()
        }
        previousRevision = result.revision
      } catch {
        // Keep the last navigation while the local server recompiles.
      } finally {
        busy = false
      }
    }
    void poll()
    const timer = setInterval(() => void poll(), 2000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [refreshPrivateNav, locale, pathname, router, nav])

  return <NavContext.Provider value={liveNav}>{children}</NavContext.Provider>
}

// Null outside the docs layout (the players render no nav chrome).
export function useNavData(): NavData | null {
  return useContext(NavContext)
}

// The nav with hidden links filtered out — the sidebar/home-cards view.
export function useVisibleNav(): ReadonlyArray<NavGroup> {
  const nav = useNavData()
  return useMemo(
    () =>
      (nav?.groups ?? [])
        .map((group) => ({
          ...group,
          links: group.links.filter((link) => !link.hidden),
        }))
        .filter((group) => group.links.length > 0),
    [nav],
  )
}

// Kept as the navigation hook consumed by sidebar, cards and pins.
export function useUnlockedNav(): ReadonlyArray<NavGroup> {
  return useVisibleNav()
}

// Client-side counterpart of lib/nav's localizedTitle(): nav-mirroring
// strings resolve via the title map; anything else tries an explicit
// `title.<English>` message key and falls back to the English text.
// Degrades to the fallbacks outside the docs layout (players render
// data-driven or hardcoded titles, so the map isn't needed there).
export function useLocalizedTitle(): (english: string) => string {
  const nav = useNavData()
  const locale = useLocale()
  return (english) =>
    nav?.titleMap[english] ?? tKey(locale, `title.${english}`) ?? english
}
