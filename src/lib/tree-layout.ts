// SVG layout for the Tree of Life diagram: the data join of the fixed
// positions (lib/tree-geometry.ts, client-safe) with the sephiroth
// records. Server-side only — it imports @/content/data, so client
// renderers must not import it; TreeOfLifeSvg gets its data via the
// treeSvgData() props built here.

import {
  getSephiroth,
  getTarot,
  paths,
  SEPHIROTH_DESCENT_SLUGS,
  type Sephirah,
} from '@/content/data'
import { POSITIONS, TREE_VIEWBOX } from '@/lib/tree-geometry'
import { DEFAULT_LOCALE, type Locale } from '@/lib/locales'

// Re-exported for the server-side consumers (ProgressiveTree,
// astro/layout) that import the viewBox from here.
export { TREE_VIEWBOX }

// Layout geometry is keyed by slug and locale-independent; display
// consumers re-read localized records themselves.
const { sephiroth: baseSephiroth } = getSephiroth(DEFAULT_LOCALE)

export type PlacedSephirah = Sephirah & { cx: number; cy: number }

export const sephiroth: ReadonlyArray<PlacedSephirah> = baseSephiroth.map(
  (s) => {
    const pos = POSITIONS[s.slug]
    if (!pos)
      throw new Error(`No tree-layout position for sephirah "${s.slug}"`)
    return { ...s, cx: pos.cx, cy: pos.cy }
  },
)

// The serializable slice TreeOfLifeSvg needs, localized — built by the
// server parent and passed down as props so the datasets stay out of the
// client bundle. Path entries carry their tarot card's display fields;
// sephiroth carry localized names joined with their fixed positions.
export interface TreeSvgPath {
  slug: string
  from: string
  to: string
  num: number
  name: string
  color: string
}

export interface TreeSvgSephirah {
  slug: string
  cx: number
  cy: number
  name: string
  hebrewName: string
  color: string
  quadrantColors?: Sephirah['quadrantColors']
}

export interface TreeSvgData {
  paths: ReadonlyArray<TreeSvgPath>
  sephiroth: ReadonlyArray<TreeSvgSephirah>
}

// The slice ProgressiveTree needs — geometry, structural colors, and the
// descent order. Locale-independent (color names are palette keys).
export interface ProgressiveTreeData {
  paths: ReadonlyArray<{ from: string; to: string }>
  sephiroth: ReadonlyArray<{
    slug: string
    cx: number
    cy: number
    color: string
    quadrantColors?: Sephirah['quadrantColors']
  }>
  descentSlugs: ReadonlyArray<string>
}

export function progressiveTreeData(): ProgressiveTreeData {
  return {
    paths: paths.map((p) => ({ from: p.from, to: p.to })),
    sephiroth: sephiroth.map((s) => ({
      slug: s.slug,
      cx: s.cx,
      cy: s.cy,
      color: s.color,
      quadrantColors: s.quadrantColors,
    })),
    descentSlugs: SEPHIROTH_DESCENT_SLUGS,
  }
}

export function treeSvgData(locale: Locale): TreeSvgData {
  const { cardBySlug } = getTarot(locale)
  const { sephirahBySlug } = getSephiroth(locale)
  return {
    paths: paths.flatMap((p) => {
      const card = cardBySlug[p.slug]
      return card
        ? [
            {
              slug: p.slug,
              from: p.from,
              to: p.to,
              num: card.num,
              name: card.name,
              color: card.color,
            },
          ]
        : []
    }),
    sephiroth: sephiroth.map((s) => ({
      slug: s.slug,
      cx: s.cx,
      cy: s.cy,
      name: sephirahBySlug[s.slug]?.name ?? s.name,
      hebrewName: s.hebrewName,
      color: s.color,
      quadrantColors: s.quadrantColors,
    })),
  }
}
