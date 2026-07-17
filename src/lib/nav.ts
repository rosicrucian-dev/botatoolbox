// Navigation assembly. The hand-authored group/link content (the
// English source of truth) lives in ./nav-data.ts; this module fills in
// the generated Rituals/Texts groups from the content manifests, sorts,
// and derives the visible view — per locale. `getNavigation(locale)` /
// `getVisibleNavigation(locale)` localize titles/descriptions through
// the message catalog (nav.* keys) and the content overlays. Structural
// consumers (integrity checks, sitemap, breadcrumb segment mapping —
// group slugs always derive from the ENGLISH titles) call
// `getNavigation(DEFAULT_LOCALE)` explicitly.

import { getRituals, getTexts } from '@/content/data'
import { defineLocalized } from '@/content/data/localized'
import { tDyn } from '@/content/messages'
import { DEFAULT_LOCALE, type Locale } from '@/lib/locales'
import {
  navGroups,
  navGroupSlug,
  type NavGroup,
  type NavLink,
} from '@/lib/nav-data'

export type { NavGroup, NavLink }

export const getNavigation = defineLocalized((locale) => {
  const groups: Array<NavGroup> = navGroups.map((group) => {
    // Generated groups: links come from the content manifests, whose
    // titles/descriptions localize through the data overlays.
    const links: Array<NavLink> =
      group.generated === 'rituals'
        ? getRituals(locale).visibleRituals.map((r) => ({
            title: r.title,
            href: `/rituals/${r.slug}`,
            description: r.description,
          }))
        : group.generated === 'texts'
          ? getTexts(locale).visibleTexts.map((t) => ({
              title: t.title,
              href: `/texts/${t.slug}`,
              description: t.description,
            }))
          : group.links.map((link) => ({
              ...link,
              title: tDyn(locale, `nav.${link.href}.title`, link.title),
              description: link.description
                ? tDyn(locale, `nav.${link.href}.description`, link.description)
                : undefined,
            }))
    return {
      ...group,
      slug: navGroupSlug(group.title),
      title: tDyn(
        locale,
        `nav.group.${navGroupSlug(group.title)}.title`,
        group.title,
      ),
      links,
    }
  })
  // Sort by the ENGLISH titles so group order is identical across
  // locales (localeCompare on translated titles would shuffle groups
  // between languages).
  const englishTitle = new Map(
    groups.map((g, i) => [g, navGroups[i].title] as const),
  )
  return groups.sort((a, b) =>
    englishTitle.get(a)!.localeCompare(englishTitle.get(b)!),
  )
})

export const getVisibleNavigation = defineLocalized((locale) =>
  getNavigation(locale)
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => !link.hidden),
    }))
    .filter((group) => group.links.length > 0),
)

// English display string → localized, across group titles and every
// link title (hidden included; generated Rituals/Texts titles come from
// the localized data manifests). Drives the CENTRALIZED localization of
// static page titles, breadcrumb labels, and page headings whose text
// mirrors the nav — which is nearly every non-detail page — so those
// ~50 pages don't each need their own message key.
export const getNavTitleMap = defineLocalized((locale) => {
  const map = new Map<string, string>()
  const english = getNavigation(DEFAULT_LOCALE)
  const localized = getNavigation(locale)
  english.forEach((group, gi) => {
    if (!map.has(group.title)) map.set(group.title, localized[gi].title)
    group.links.forEach((link, li) => {
      if (!map.has(link.title)) {
        map.set(link.title, localized[gi].links[li].title)
      }
    })
  })
  return map
})

/**
 * Localize an English display title: nav-mirroring strings resolve via
 * the map above; anything else tries an explicit `title.<English>` key
 * in the message catalog (for the few non-nav titles, e.g. 'Piano') and
 * falls back to the English text itself.
 */
export function localizedTitle(locale: Locale, english: string): string {
  return (
    getNavTitleMap(locale).get(english) ??
    tDyn(locale, `title.${english}`, english)
  )
}
