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
import { navGroups } from '@/lib/nav-data'

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

// Static routes — every non-player docs page. Player routes are
// intentionally omitted; they're standalone meditation tools, not
// content Google should land users on directly.
const staticRoutes = [
  '/',
  '/about',
  '/radio',
  '/astrology/chart',
  '/astrology/hora',
  '/reference/alchemy',
  '/reference/astrology',
  '/reference/chakras',
  '/reference/elements',
  '/reference/qabalah',
  '/cube-of-space',
  '/reference/grades',
  '/reference/hebrew',
  '/healing/planets',
  '/healing/signs',
  '/files',
  '/gematria/calculator',
  '/gematria/dictionary',
  '/links',
  '/reference/numerology',
  '/practice/quiz',
  '/settings',
  '/reference/tattvas',
  '/tarot/correspondences',
  '/tarot/freeform',
  '/tarot/major-arcana',
  '/tarot/minor-arcana',
  '/tarot/tableau',
  '/keyboard',
  '/keyboard/tableau',
  '/timer',
  '/tree-of-life',
  '/practice/words-of-power',
]

// Group landing pages (the card grid for each sidebar group). Excludes
// /meditations (gated: 'secret'). Each dual-URL page has one canonical URL
// listed above and its alias omitted: for Devices the canonical is the flat
// URL (/cube-of-space) and /devices/cube-of-space is the alias; for Practice
// the canonical is the grouped URL (/practice/quiz) and /quiz is the alias.
const groupRoutes = [
  '/astrology',
  '/devices',
  '/gematria',
  '/healing',
  '/practice',
  '/reference',
  '/resources',
  '/rituals',
  '/tarot',
  '/texts',
  '/utilities',
  '/website',
]

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
    ...groupingsInOrder.map((g) => `/recordings/${g.slug}`),
    ...recordings
      .filter((r) => !r.hidden)
      .map((r) => `/recordings/${r.groupingSlug}/${r.slug}`),
    ...sephiroth.map((s) => `/tree-of-life/${s.slug}`),
    ...astrologySigns.map((s) => `/reference/astrology/signs/${s.slug}`),
    ...astrologyPlanets.map((p) => `/reference/astrology/planets/${p.slug}`),
  ].flatMap(entries)
}
