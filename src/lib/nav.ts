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
import {
  DEFAULT_LOCALE,
  localeHref,
  toLocale,
  type Locale,
} from '@/lib/locales'
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
 * A page's canonical URL, as the `alternates` of its metadata, from its
 * unprefixed path: `alternates: canonicalFor(locale, '/tarot/the-fool')`.
 *
 * EVERY PAGE THAT SHOULD BE INDEXED DECLARES ONE (25 November 2026), so
 * that an address with a query string (`?idx=`, `?q=`), or a second
 * route to the same thing (/tarot/0 beside /tarot/the-fool), tells a
 * search engine which URL is the page. It is declared per page and not
 * once in a layout because a layout cannot know the path, and Next's
 * relative `./` form would resolve against the build path, which for
 * English is under /en/ until scripts/hoist-en.ts lifts it to the root.
 * `test/seo.test.ts` fails if a docs page forgets.
 *
 * The path is the one WITHOUT the locale; German gets its /de/ here,
 * and the trailing slash is the one the export serves (`trailingSlash`
 * in next.config.mjs). The root layout's `metadataBase` makes it
 * absolute.
 */
export function canonicalFor(
  locale: Locale,
  path: string,
): { canonical: string } {
  return {
    canonical: localeHref(locale, path.endsWith('/') ? path : `${path}/`),
  }
}

/**
 * The `generateMetadata` export for a page whose title mirrors a nav entry —
 * which is nearly every non-detail page. Replaces the ten-line
 * params → toLocale → localizedTitle boilerplate:
 *
 *   export const generateMetadata = localizedMetadata('Keyboard', '/keyboard')
 *
 * The second argument is the page's own unprefixed path, for its
 * canonical URL (see `canonicalFor`). Pages whose title comes from data
 * (a card, a text) still write their own.
 */
export function localizedMetadata(english: string, path: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>
  }): Promise<{ title: string; alternates: { canonical: string } }> {
    const locale = toLocale((await params).locale)
    return {
      title: localizedTitle(locale, english),
      alternates: canonicalFor(locale, path),
    }
  }
}
