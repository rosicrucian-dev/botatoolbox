// Zod schemas for every JSON data file. Wrappers import these to parse
// + type their data; `scripts/gen-schemas.ts` imports them to emit the
// matching `.schema.json` files used by editor autocomplete.
//
// Keeping schemas separate from JSON loading lets Node run the generator
// without needing import-attributes (`with { type: 'json' }`) — webpack
// and the data wrappers don't load this file at all at runtime if they
// only need the data.

import { z } from 'zod'

// ---------- tarot.json ----------
export const TarotCardSchema = z.object({
  num: z.number(),
  name: z.string(),
  slug: z.string(),
  letter: z.string(),
  significance: z.string(),
  astrology: z.string(),
  color: z.string(),
  note: z.string(),
  gematria: z.number(),
  alchemy: z.string(),
  intelligence: z.string(),
  power: z.string(),
  human: z.string(),
})

// ---------- words.json ----------
export const WordLetterSchema = z.object({
  letter: z.string(),
  pronunciation: z.string(),
})

export const WordSchema = z.object({
  slug: z.string(),
  name: z.string(),
  english: z.string().optional(),
  meaning: z.string().optional(),
  wordSizes: z.array(z.number()).optional(),
  letters: z.array(WordLetterSchema),
})

// ---------- signs.json ----------
//
// Astrology notes:
//   - Mercury and Venus each rule two signs (classical scheme).
//   - The three "modern" planets (Uranus, Neptune, Pluto) co-rule one
//     sign each alongside the traditional ruler:
//       Scorpio  → Mars + Pluto
//       Aquarius → Saturn + Uranus
//       Pisces   → Jupiter + Neptune
//   - Four signs (Gemini, Leo, Sagittarius, Aquarius) have no
//     traditional exaltation. `exaltedBy: null`. Leo's modern exaltation
//     (Pluto) is included since modern sources commonly cite it; the
//     others are too contested to assert.
export const SignSchema = z.object({
  slug: z.string().describe('URL slug (lowercase sign name).'),
  name: z.string(),
  symbol: z.string().describe('Unicode astrological glyph (e.g. ♈).'),
  letter: z.string().describe('Hebrew letter attributed to this sign.'),
  bodyPart: z.string().describe('Body region governed by this sign.'),
  element: z.enum(['Fire', 'Earth', 'Air', 'Water']),
  quality: z.enum(['Cardinal', 'Fixed', 'Mutable']),
  rulers: z
    .array(z.string())
    .describe('Planet slugs that rule this sign — traditional first, modern co-ruler second.'),
  exaltedBy: z
    .string()
    .nullable()
    .describe('Planet slug exalted in this sign, or null if none.'),
})

// ---------- planets.json ----------
//
// Order is the chakra-meditation sequence (root → crown), with the three
// modern planets appended. The healing-pages player iterates entries
// that have a `chakra` set; astrology pages list all 10.
export const PlanetSchema = z.object({
  slug: z.string().describe('URL slug (lowercase planet name).'),
  name: z.string(),
  symbol: z.string().describe('Unicode astrological glyph (e.g. ☉).'),
  letter: z.string().describe('Hebrew letter attributed to this planet.'),
  chakra: z
    .string()
    .optional()
    .describe('Chakra meditated upon for this planet. Modern planets (Uranus/Neptune/Pluto) omit this.'),
  rules: z
    .array(z.string())
    .describe('Sign slugs ruled by this planet.'),
  exaltedIn: z
    .string()
    .nullable()
    .describe('Sign slug where this planet is exalted, or null if none.'),
})

// ---------- minor-arcana.json ----------
export const MinorCardSchema = z.object({
  num: z.string(),
  keyword: z.string(),
})

export const MinorSuitSchema = z.object({
  suit: z.string(),
  cards: z.array(MinorCardSchema),
})

// ---------- sephiroth.json ----------
const QuadrantColors = z.object({
  top: z.string(),
  right: z.string(),
  bottom: z.string(),
  left: z.string(),
})

export const SephirahSchema = z.object({
  slug: z.string(),
  hebrewName: z.string(),
  name: z.string(),
  grade: z.string(),
  element: z.string(),
  mantraSlug: z.string(),
  color: z.string(),
  quadrantColors: QuadrantColors.optional(),
})

// ---------- tree-paths.json ----------
export const TreePathSchema = z.object({
  slug: z.string(),
  from: z.string(),
  to: z.string(),
})
