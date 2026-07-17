// BOTA Cube of Space attributions — which card sits on each face/edge and
// which way each edge's flow runs. The 3D geometry (corner coordinates,
// positions, UV wraps) lives with its renderers (CubeCanvas.tsx and
// scripts/gen-cube-pdf.ts); this module owns only the attributions.

import { z } from 'zod'

import { DEFAULT_LOCALE } from '@/lib/locales'
import cubeData from '@content/data/cube-of-space.json'
import { byKey } from './helpers'
import {
  CubeEdgeSchema,
  CubeFaceSchema,
  CubeFlowDirectionSchema,
  CubeOfSpaceSchema,
} from './schemas'
import { getTarot } from './tarot'

// Structural join only (astrology attribution, never displayed from
// here) — English on purpose.
const { cardBySlug } = getTarot(DEFAULT_LOCALE)

export type CubeEdge = z.infer<typeof CubeEdgeSchema>
export type CubeFace = z.infer<typeof CubeFaceSchema>
export type CubeFlowDirection = z.infer<typeof CubeFlowDirectionSchema>

export const cubeOfSpace = CubeOfSpaceSchema.parse(cubeData)

export const cubeEdges: ReadonlyArray<CubeEdge> = cubeOfSpace.edges
export const cubeFaces: ReadonlyArray<CubeFace> = cubeOfSpace.faces

export const cubeEdgeById = byKey(cubeEdges, 'id', 'cube edge.id')
export const cubeFaceById = byKey(cubeFaces, 'id', 'cube face.id')

// Zodiac sign (lowercase) → flow direction, derived from each edge card's
// astrology. Every simple Hebrew letter / zodiac sign sits on exactly one
// cube edge, so a sign IS an edge for flow purposes.
export const cubeFlowBySign: Record<string, CubeFlowDirection> =
  Object.fromEntries(
    cubeEdges.map((e) => {
      const card = cardBySlug[e.cardSlug]
      if (!card) {
        throw new Error(`No tarot card for cube edge ${e.id} (${e.cardSlug})`)
      }
      return [card.astrology.toLowerCase(), e.flow]
    }),
  )

// Zodiac sign (lowercase) → edge id, same derivation.
export const cubeEdgeIdBySign: Record<string, CubeEdge['id']> =
  Object.fromEntries(
    cubeEdges.map((e) => [
      cardBySlug[e.cardSlug].astrology.toLowerCase(),
      e.id,
    ]),
  )
