import { type MetadataRoute } from 'next'

import {
  astrologyPlanets,
  astrologySigns,
  cards,
  minorCards,
  sephiroth,
  visibleRituals,
  visibleTexts,
  words,
} from '@/content/data'

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
  return [
    ...[...staticRoutes, ...groupRoutes].map((path) => ({
      url: `${SITE}${path}`,
      lastModified,
    })),
    ...cards.map((c) => ({
      url: `${SITE}/tarot/${c.slug}`,
      lastModified,
    })),
    ...minorCards.map((c) => ({
      url: `${SITE}/tarot/${c.slug}`,
      lastModified,
    })),
    ...words.map((w) => ({
      url: `${SITE}/practice/words-of-power/${w.slug}`,
      lastModified,
    })),
    ...visibleTexts.map((t) => ({
      url: `${SITE}/texts/${t.slug}`,
      lastModified,
    })),
    ...visibleRituals.map((r) => ({
      url: `${SITE}/rituals/${r.slug}`,
      lastModified,
    })),
    ...sephiroth.map((s) => ({
      url: `${SITE}/tree-of-life/${s.slug}`,
      lastModified,
    })),
    ...astrologySigns.map((s) => ({
      url: `${SITE}/reference/astrology/signs/${s.slug}`,
      lastModified,
    })),
    ...astrologyPlanets.map((p) => ({
      url: `${SITE}/reference/astrology/planets/${p.slug}`,
      lastModified,
    })),
  ]
}
