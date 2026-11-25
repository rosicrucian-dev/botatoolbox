// Builds the serializable slices the Cube of Space UI needs. Server-only
// (imports @/content/data); the cube pages build these at render time
// and pass them as props so the datasets stay out of the client bundle.

import {
  cubeEdgeIdBySign,
  cubeEdges,
  cubeFaces,
  cubeFlowBySign,
  getTarot,
  type CubeFace,
  type CubeFlowDirection,
} from '@/content/data'
import { DEFAULT_LOCALE, type Locale } from '@/lib/locales'

// The card fields the 3D scene reads: image path parts (num, slug) and
// the structural color attribution (a palette key — English on purpose).
export interface CubeCardRef {
  num: number
  slug: string
  color: string
}

export interface CubeSceneData {
  faces: ReadonlyArray<CubeFace>
  // Face + edge cards by slug.
  cards: Record<string, CubeCardRef>
  // Edge id → its card's slug (the scene colors face borders from the
  // bordering edge's card).
  edgeCardSlugById: Record<string, string>
  flowBySign: Record<string, CubeFlowDirection>
  edgeIdBySign: Record<string, string>
}

export function cubeSceneData(): CubeSceneData {
  const { cardBySlug } = getTarot(DEFAULT_LOCALE)
  const cards: Record<string, CubeCardRef> = {}
  const ref = (slug: string) => {
    const c = cardBySlug[slug]
    if (c) cards[slug] = { num: c.num, slug: c.slug, color: c.color }
  }
  for (const f of cubeFaces) ref(f.cardSlug)
  for (const e of cubeEdges) ref(e.cardSlug)
  return {
    faces: cubeFaces,
    cards,
    edgeCardSlugById: Object.fromEntries(
      cubeEdges.map((e) => [e.id, e.cardSlug]),
    ),
    flowBySign: cubeFlowBySign,
    edgeIdBySign: cubeEdgeIdBySign,
  }
}

// The cube's attributions as text for screen readers, localized.
export interface CubeAttributions {
  faces: ReadonlyArray<{ id: string; cardName: string }>
  edges: ReadonlyArray<{ id: string; cardName: string; flow: string }>
}

export function cubeAttributions(locale: Locale): CubeAttributions {
  const { cardBySlug } = getTarot(locale)
  return {
    faces: cubeFaces.map((f) => ({
      id: f.id,
      cardName: cardBySlug[f.cardSlug]?.name ?? f.cardSlug,
    })),
    edges: cubeEdges.map((e) => ({
      id: e.id,
      cardName: cardBySlug[e.cardSlug]?.name ?? e.cardSlug,
      flow: e.flow,
    })),
  }
}
