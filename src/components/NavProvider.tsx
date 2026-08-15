'use client'

import { createContext, useContext, useMemo } from 'react'

import { useLocale } from '@/components/LocaleProvider'
import { tKey } from '@/content/messages'
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
  children,
}: {
  nav: NavData
  children: React.ReactNode
}) {
  return <NavContext.Provider value={nav}>{children}</NavContext.Provider>
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
