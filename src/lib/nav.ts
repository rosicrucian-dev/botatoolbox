// Navigation assembly. Structure (hrefs, grouping, flags) is
// hand-authored in ./nav-data.ts; display strings come from the message
// catalog (content/messages/en.json + translated siblings) under keys
// derived from the slugs/hrefs; the generated Rituals/Texts groups pull
// their links from the localized content manifests. A module-load
// assertion guarantees every hand-authored entry has its catalog keys —
// a missing nav title is a loud build failure, not silent fallback.
// Structural consumers (integrity checks, breadcrumb segment mapping)
// call `getNavigation(DEFAULT_LOCALE)` explicitly.

import { getRituals, getTexts } from '@/content/data'
import { defineLocalized } from '@/content/data/localized'
import { en as messages, tKey } from '@/content/messages'
import { DEFAULT_LOCALE, type Locale } from '@/lib/locales'
import { navGroups } from '@/lib/nav-data'

export interface NavLink {
  title: string
  href: string
  // Used by the home page TOC cards. Sidebar nav ignores this.
  description?: string
  // See RawNavLink.hidden in nav-data.ts.
  hidden?: boolean
}

export interface NavGroup {
  title: string
  // Stable locale-independent id (also the landing page's URL segment).
  slug: string
  links: Array<NavLink>
  flat?: true
  gated?: 'secret'
  generated?: 'rituals' | 'texts'
}

// Every hand-authored group/link must have its English catalog entry —
// checked once at module load, integrity-style.
for (const group of navGroups) {
  if (messages[`nav.group.${group.slug}.title`] === undefined) {
    throw new Error(
      `nav: missing "nav.group.${group.slug}.title" in content/messages/en.json`,
    )
  }
  for (const link of group.links) {
    if (messages[`nav.${link.href}.title`] === undefined) {
      throw new Error(
        `nav: missing "nav.${link.href}.title" in content/messages/en.json`,
      )
    }
  }
}

export const getNavigation = defineLocalized((locale) => {
  const groups: Array<NavGroup> = navGroups.map((group) => {
    // Generated groups: links come from the content manifests, whose
    // titles/descriptions localize through the data files.
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
              title: tKey(locale, `nav.${link.href}.title`)!,
              description: tKey(locale, `nav.${link.href}.description`),
            }))
    return {
      ...group,
      title: tKey(locale, `nav.group.${group.slug}.title`)!,
      links,
    }
  })
  // Sort by slug so group order is identical across locales
  // (localeCompare on translated titles would shuffle groups between
  // languages).
  return groups.sort((a, b) => a.slug.localeCompare(b.slug))
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
 * in the message catalog (for the few non-nav titles, e.g. 'Astrology
 * Chart') and falls back to the English text itself.
 */
export function localizedTitle(locale: Locale, english: string): string {
  return (
    getNavTitleMap(locale).get(english) ??
    tKey(locale, `title.${english}`) ??
    english
  )
}
