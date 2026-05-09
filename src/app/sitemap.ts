import { type MetadataRoute } from 'next'

import { signs, planets } from '@/content/data/astrology'
import { sephiroth, words } from '@/content/data'
import { cards } from '@/content/data/tarot'

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
  '/astrology',
  '/cube-of-space',
  '/healing/planets',
  '/healing/signs',
  '/resources/files',
  '/resources/gematria',
  '/resources/links',
  '/resources/tattvas',
  '/rituals/lrp',
  '/tarot/major-arcana',
  '/tarot/minor-arcana',
  '/tarot/tableau',
  '/texts/emerald-tablet-hermes',
  '/texts/pattern-trestleboard',
  '/tools/keyboard',
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
    ...words.map((w) => ({
      url: `${SITE}/words-of-power/${w.slug}`,
      lastModified,
    })),
    ...sephiroth.map((s) => ({
      url: `${SITE}/tree-of-life/${s.slug}`,
      lastModified,
    })),
    ...signs.map((s) => ({
      url: `${SITE}/astrology/signs/${s.slug}`,
      lastModified,
    })),
    ...planets.map((p) => ({
      url: `${SITE}/astrology/planets/${p.slug}`,
      lastModified,
    })),
  ]
}
