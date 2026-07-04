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
  '/ann-davies-radio',
  '/astrology/chart',
  '/astrology/hora',
  '/reference/alchemy',
  '/reference/astrology',
  '/reference/chakras',
  '/reference/elements',
  '/reference/qabalah',
  '/cube-of-space',
  '/reference/grades',
  '/healing/planets',
  '/healing/signs',
  '/files',
  '/gematria/calculator',
  '/gematria/dictionary',
  '/links',
  '/reference/numerology',
  '/quiz',
  '/settings',
  '/reference/tattvas',
  '/tarot/correspondences',
  '/tarot/freeform',
  '/tarot/major-arcana',
  '/tarot/minor-arcana',
  '/tarot/tableau',
  '/keyboard',
  '/keyboard/tableau',
  '/tree-of-life',
  '/words-of-power',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    ...staticRoutes.map((path) => ({
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
      url: `${SITE}/words-of-power/${w.slug}`,
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
