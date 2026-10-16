import { type MetadataRoute } from 'next'

import {
  getAstrology,
  getMinorArcana,
  getRecordings,
  getRituals,
  getSephiroth,
  getTarot,
  getTexts,
  getWords,
} from '@/content/data'
import { DEFAULT_LOCALE, RELEASED_LOCALES, type Locale } from '@/lib/locales'
import { navGroups } from '@/lib/navData'

// Slugs are locale-independent — the sitemap enumerates from the
// English source on purpose (both locales' URLs are emitted below).
const { cards } = getTarot(DEFAULT_LOCALE)
const { minorCards } = getMinorArcana(DEFAULT_LOCALE)
const { words } = getWords(DEFAULT_LOCALE)
const { visibleTexts } = getTexts(DEFAULT_LOCALE)
const { visibleRituals } = getRituals(DEFAULT_LOCALE)
const { sephiroth } = getSephiroth(DEFAULT_LOCALE)
const { astrologySigns, astrologyPlanets } = getAstrology(DEFAULT_LOCALE)
const { recordings, groupingsInOrder } = getRecordings(DEFAULT_LOCALE)

// Recordings are omitted from the sitemap while the section is hidden in the
// nav (single source of truth) — so crawlers don't index the partial,
// audio-less pages before launch. Un-hiding the nav link publishes them here.
const recordingsPublic = !navGroups
  .flatMap((g) => g.links)
  .some((l) => l.href === '/recordings' && l.hidden)

// Required by `output: 'export'` for metadata routes — emits a static
// /sitemap.xml file at build time instead of treating it as dynamic.
export const dynamic = 'force-static'

const SITE = 'https://botatoolbox.org'

// Static routes are DERIVED from the nav (src/lib/nav-data.ts) so the sitemap
// can never drift from the sidebar: every hand-authored, non-hidden
// link, plus each group's landing page. Hidden links are excluded.
// Player routes are intentionally omitted; they're standalone
// meditation tools, not content Google should land users on directly.
const publicGroups = navGroups

// Docs pages with no nav entry of their own — sibling tabs under a nav-listed
// page. The only place a new non-nav docs page has to be added.
const extraRoutes = ['/keyboard/tableau']

const staticRoutes = [
  '/',
  ...publicGroups.flatMap((g) =>
    g.links.filter((l) => !l.hidden).map((l) => l.href),
  ),
  ...extraRoutes,
]

// Group landing pages (the card grid for each sidebar group).
const groupRoutes = publicGroups.map((g) => `/${g.slug}`)

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Each logical page exists once per locale: English unprefixed (the
  // build's /en/ tree is hoisted to the root by scripts/hoist-en.ts) and
  // every translated locale under its /<locale>/ prefix. All rows carry
  // the same hreflang alternates so crawlers pair them up; x-default
  // points at English. Iterates LOCALES, so new locales join
  // automatically.
  function url(locale: Locale, path: string): string {
    if (locale === DEFAULT_LOCALE) return `${SITE}${path}`
    return `${SITE}/${locale}${path === '/' ? '' : path}`
  }
  function entries(path: string): MetadataRoute.Sitemap {
    const alternates = {
      languages: {
        ...Object.fromEntries(RELEASED_LOCALES.map((l) => [l, url(l, path)])),
        'x-default': url(DEFAULT_LOCALE, path),
      },
    }
    return RELEASED_LOCALES.map((locale) => ({
      url: url(locale, path),
      lastModified,
      alternates,
    }))
  }

  return [
    ...staticRoutes,
    ...groupRoutes,
    ...cards.map((c) => `/tarot/${c.slug}`),
    ...minorCards.map((c) => `/tarot/${c.slug}`),
    ...words.map((w) => `/practice/words-of-power/${w.slug}`),
    ...visibleTexts.map((t) => `/texts/${t.slug}`),
    ...visibleRituals.map((r) => `/rituals/${r.slug}`),
    // '/recordings' itself arrives through staticRoutes once its nav link
    // is un-hidden; only the per-grouping and per-recording pages go here.
    ...(recordingsPublic
      ? [
          ...groupingsInOrder.map((g) => `/recordings/${g.slug}`),
          ...recordings
            .filter((r) => !r.hidden)
            .map((r) => `/recordings/${r.groupingSlug}/${r.slug}`),
        ]
      : []),
    ...sephiroth.map((s) => `/tree-of-life/${s.slug}`),
    ...astrologySigns.map((s) => `/reference/astrology/signs/${s.slug}`),
    ...astrologyPlanets.map((p) => `/reference/astrology/planets/${p.slug}`),
  ].flatMap(entries)
}
