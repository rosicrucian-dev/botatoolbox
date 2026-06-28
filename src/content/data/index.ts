// Top-level data exports. Each domain has its own typed module that
// validates its JSON via Zod and exposes lookup maps; this index is the
// re-export hub so consumers can pull anything from
// `@/content/data` without knowing which module owns what.
//
//   - tarot.ts        — major arcana + cardImage()/thumbImage()
//   - minor-arcana.ts — minor arcana flat list + minorImage variants
//   - grades.ts       — Golden Dawn grade ladder + sephirah lookup
//   - astrology.ts    — signs + planets joined with their tarot card
//   - meditations.ts  — Tarot Fundamentals + Supersensory Powers
//   - tattvas.ts      — element-pair attributions
//   - rituals/*.ts    — Markdown parsers
//   - texts/*.ts      — Markdown parsers
//   - helpers.ts      — byKey<T>() and other shared utilities
//
// All schemas live in ./schemas.ts; cross-file integrity in ./integrity.ts.

import { z } from 'zod'

import sephirothData from '@content/data/sephiroth.json'
import signsData from '@content/data/signs.json'
import planetsData from '@content/data/planets.json'
import treePathsData from '@content/data/tree-paths.json'
import wordsData from '@content/data/words.json'

import {
  SephirahSchema,
  SignSchema,
  PlanetSchema,
  TreePathSchema,
  WordSchema,
  WordLetterSchema,
} from './schemas'
import { byKey } from './helpers'

// ---- domain modules: re-export so consumers can import from
// `@/content/data` even when the data lives in a peer module.
export * from './grades'
export * from './minor-arcana'
export * from './chakras'
export * from './numerology'
export * from './gematria-words'
export * from './gematria-sources'
export * from './texts'

// ---- types

export type Sephirah = z.infer<typeof SephirahSchema>
export type HealingSign = z.infer<typeof SignSchema>
export type HealingPlanet = z.infer<typeof PlanetSchema>
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

export const paths: ReadonlyArray<TreePath> = z
  .array(TreePathSchema)
  .parse(treePathsData)

export const words: ReadonlyArray<Word> = z
  .array(WordSchema)
  .parse(wordsData)

export const wordBySlug = byKey(words, 'slug', 'word.slug')

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

export const sephirahBySlug = byKey(sephiroth, 'slug', 'sephirah.slug')
