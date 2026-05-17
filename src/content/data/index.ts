// Top-level data exports — content files that are pure attribution
// tables with at most a single lookup map. Files with non-trivial logic
// keep their own modules:
//
//   - tarot.ts        — three lookup maps + cardImage()
//   - tattvas.ts      — tattvaByKind + SUB_ORDER
//   - astrology.ts    — hand-coded rulership/exaltation, joins tarot
//   - rituals/*.ts    — Markdown parsers
//   - texts/*.ts      — Markdown parsers
//
// All schemas live in ./schemas.ts; cross-file integrity in ./integrity.ts.

import { z } from 'zod'

import sephirothData from '@content/data/sephiroth.json'
import signsData from '@content/data/signs.json'
import planetsData from '@content/data/planets.json'
import minorArcanaData from '@content/data/minor-arcana.json'
import treePathsData from '@content/data/tree-paths.json'
import wordsData from '@content/data/words.json'

import {
  SephirahSchema,
  SignSchema,
  PlanetSchema,
  MinorSuitSchema,
  MinorCardSchema,
  TreePathSchema,
  WordSchema,
  WordLetterSchema,
} from './schemas'

// ---- types

export type Sephirah = z.infer<typeof SephirahSchema>
export type HealingSign = z.infer<typeof SignSchema>
export type HealingPlanet = z.infer<typeof PlanetSchema>
export type MinorCard = z.infer<typeof MinorCardSchema>
export type MinorSuit = z.infer<typeof MinorSuitSchema>
export type TreePath = z.infer<typeof TreePathSchema>
export type Word = z.infer<typeof WordSchema>
export type WordLetter = z.infer<typeof WordLetterSchema>

// ---- data

export const sephiroth: ReadonlyArray<Sephirah> = z
  .array(SephirahSchema)
  .parse(sephirothData)

export const signs: ReadonlyArray<HealingSign> = z
  .array(SignSchema)
  .parse(signsData)

export const planets: ReadonlyArray<HealingPlanet> = z
  .array(PlanetSchema)
  .parse(planetsData)

export const suits: ReadonlyArray<MinorSuit> = z
  .array(MinorSuitSchema)
  .parse(minorArcanaData)

export const paths: ReadonlyArray<TreePath> = z
  .array(TreePathSchema)
  .parse(treePathsData)

export const words: ReadonlyArray<Word> = z
  .array(WordSchema)
  .parse(wordsData)

export const wordBySlug = Object.fromEntries(
  words.map((w) => [w.slug, w]),
) as Record<string, Word>

// Sephiroth in tree-descent order (Kether → Malkuth). The JSON array
// itself follows the source-PDF order (Malkuth-first), so consumers
// that need descent semantics — the Pattern on the Trestleboard player,
// ProgressiveTree's `filledThrough` index — use this list instead of
// relying on array position.
export const SEPHIROTH_DESCENT_SLUGS = [
  'kether',
  'chokmah',
  'binah',
  'chesed',
  'geburah',
  'tiphareth',
  'netzach',
  'hod',
  'yesod',
  'malkuth',
] as const

export const sephirahBySlug = Object.fromEntries(
  sephiroth.map((s) => [s.slug, s]),
) as Record<string, Sephirah>
