// Navigation assembly. Structure (hrefs, grouping, flags) is
// hand-authored in ./nav-data.ts; display strings come from the message
// catalog (content/messages/en.json + translated siblings) under keys
// derived from the slugs/hrefs. A module-load
// assertion guarantees every hand-authored entry has its catalog keys —
// a missing nav title is a loud build failure, not silent fallback.
// Structural consumers (integrity checks, breadcrumb segment mapping)
// call `getNavigation(DEFAULT_LOCALE)` explicitly.

import { defineLocalized } from '@/content/data/localized'
import { en as messages, tKey } from '@/content/messages'
import { DEFAULT_LOCALE, toLocale, type Locale } from '@/lib/locales'
import { navGroups } from '@/lib/navData'

export interface NavLink {
  title: string
  href: string
  // Used by the home page TOC cards. Sidebar nav ignores this.
  // See RawNavLink.hidden in navData.ts.
  hidden?: boolean
  // See RawNavLink.outside in navData.ts.
  outside?: true
}

export interface NavGroup {
  title: string
  // Stable locale-independent id (also the landing page's URL segment).
  slug: string
  links: Array<NavLink>
  flat?: true
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
    const links: Array<NavLink> = group.links.map((link) => ({
      ...link,
      title: tKey(locale, `nav.${link.href}.title`)!,
    }))
    return {
      ...group,
      title: tKey(locale, `nav.group.${group.slug}.title`)!,
      links,
    }
  })
  // No sort: the groups render in the order navData.ts authors them.
  // It used to sort by slug, which kept the order identical across
  // locales (sorting translated titles would shuffle the groups between
  // languages) — and so does this, the order being in the structure and
  // not in the strings. What it also does is let the order MEAN
  // something: the sidebar descends from what the reader DOES to what
  // they READ (see navGroups).
  return groups
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
// link title (hidden included). Drives the CENTRALIZED localization of
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

/**
 * The `generateMetadata` export for a page whose title mirrors a nav entry —
 * which is nearly every non-detail page. Replaces the ten-line
 * params → toLocale → localizedTitle boilerplate:
 *
 *   export const generateMetadata = localizedMetadata('Keyboard')
 *
 * Pages whose title comes from data (a card, a text) still write their own.
 */
export function localizedMetadata(english: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>
  }): Promise<{ title: string }> {
    return { title: localizedTitle(toLocale((await params).locale), english) }
  }
}
