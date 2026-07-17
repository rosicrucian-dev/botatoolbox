'use client'

import { useMemo } from 'react'

import { useLocale } from '@/components/LocaleProvider'
import { Card } from '@/components/NavCards'
import { getVisibleNavigation, type NavLink } from '@/lib/nav'
import { usePinnedCards } from '@/lib/pinnedCards'
import { useSecretMode } from '@/lib/useSecretMode'

// Pinned shortcuts at the very top of the home TOC — no heading, no
// divider, the cards just appear. Rendered only when there's at least one
// pin: no pins, no grid, no reserved space at all. The static export
// renders pins empty, so there's no pinned grid in the HTML; once the
// real pins load on hydration the grid appears and pushes the groups
// below down. Nothing is ever rendered and then removed.

// href → title, respecting secret-mode gating exactly like NavSections:
// a pin whose group is gated is only resolvable while unlocked (so a
// re-lock hides it from the row without discarding it from storage).
function usePinnedLinks(pins: Array<string>): Array<NavLink> {
  const { unlocked } = useSecretMode()
  const locale = useLocale()

  const titleByHref = useMemo(() => {
    const map = new Map<string, string>()
    for (const group of getVisibleNavigation(locale)) {
      if (group.gated === 'secret' && !unlocked) continue
      for (const link of group.links) map.set(link.href, link.title)
    }
    return map
  }, [unlocked, locale])

  return useMemo(
    () =>
      pins
        .filter((href) => titleByHref.has(href))
        // Title-only: no description carried through to the card.
        .map((href) => ({ title: titleByHref.get(href)!, href })),
    [pins, titleByHref],
  )
}

export function PinnedSection() {
  const { pins } = usePinnedCards()
  const links = usePinnedLinks(pins)

  if (links.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {links.map((link, index) => (
        <Card key={link.href} link={link} index={index} pinnable />
      ))}
    </div>
  )
}
