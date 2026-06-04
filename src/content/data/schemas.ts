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
  english: z.string(),
  // Path on the Tree of Life (11–32 — paths 1–10 are the sephiroth).
  // Always equals `num + 11` since the trumps proceed in the same order
  // as the connecting paths, but stored explicitly so consumers can read
  // it without coupling to the numbering convention.
  path: z.number().int().min(11).max(32),
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
// Astrology notes — follows Paul Case's scheme (each sign has one ruler):
//   - Mercury and Venus each rule two signs.
//   - Uranus is sole ruler of Aquarius ("octave" of Mercury).
//   - Neptune is sole ruler of Pisces ("octave" of Venus).
//   - Pluto is not assigned rulership of any sign.
//   - Five signs have no exaltation (`exaltedBy: null`):
//     Gemini, Leo, Scorpio, Sagittarius, Aquarius. Case attributes only
//     the seven classical exaltations and explicitly excludes the
//     modern Uranus/Neptune/Pluto exaltations cited by other astrologers.
export const SignSchema = z.object({
  slug: z.string().describe('URL slug (lowercase sign name).'),
  name: z.string(),
  symbol: z.string().describe('Unicode astrological glyph (e.g. ♈).'),
  letter: z.string().describe('Hebrew letter attributed to this sign.'),
  bodyPart: z.string().describe('Body region governed by this sign.'),
  quality: z.enum(['Cardinal', 'Fixed', 'Mutable']),
  rulers: z
    .array(z.string())
    .describe('Planet slug(s) that rule this sign.'),
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
  // Zodiac sign(s) attributed to this card. Number cards (2-10) sit on
  // a single decanate so they list one sign; aces and pages span their
  // element's full season-quarter (3 signs); kings/queens/knights span
  // a 30-day band straddling two adjacent signs.
  sign: z.string().optional(),
  // Date range covered by this card. Same format as `sign`: number
  // cards get a ~10-day decanate slice, aces/pages get the whole
  // season-quarter, courts get a 30-day band.
  dates: z.string().optional(),
  // Divinatory meaning, OCR'd from Paul Foster Case's 1967 Oracle of
  // Tarot. Three parts: a general intro paragraph plus the well- and
  // ill-dignified readings. Court cards (Page/Knight/Queen/King) don't
  // have a meaning in the source, so it's optional. The OCR isn't
  // perfect — quality varies card to card; expect to hand-clean.
  meaning: z
    .object({
      intro: z.string(),
      wellDignified: z.string(),
      illDignified: z.string(),
    })
    .optional(),
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
  // BOTA-style letter romanization of `hebrewName`, e.g. "MLKVTh" for
  // Malkuth (Mem-Lamed-Kaph-Vav-Tav). The list of Hebrew letters
  // spelling the name is derived from this via romanToLetters() at
  // render time — same convention as Grade.intelligenceRoman.
  hebrewRoman: z.string().optional(),
  name: z.string(),
  element: z.string(),
  mantraSlug: z.string(),
  color: z.string(),
  situationOnTree: z.string().optional(),
  briaticColors: z.string().optional(),
  astrological: z.string().optional(),
  gods: z.string().optional(),
  magicalImage: z.string().optional(),
  symbols: z.string().optional(),
  tarotMinors: z.string().optional(),
  microcosm: z.string().optional(),
  bodyCorrespondence: z.string().optional(),
  perfumes: z.string().optional(),
  stones: z.string().optional(),
  animals: z.string().optional(),
  quadrantColors: QuadrantColors.optional(),
})

// ---------- tree-paths.json ----------
export const TreePathSchema = z.object({
  slug: z.string(),
  from: z.string(),
  to: z.string(),
})

// ---------- meditations-tarot-fundamentals.json ----------
//
// 28-day meditation cycle. Every 7th day (7, 14, 21, 28) is a rest day —
// `cards` is empty and the text fields are empty strings. Non-rest days
// list the tarot card slugs to display and the paragraph + affirmation
// text. Card slugs are cross-checked against tarot.json by integrity.ts.
export const MeditationDaySchema = z.object({
  day: z.number().int().min(1).max(28),
  cards: z.array(z.string()).describe('Tarot card slugs (see tarot.json).'),
  paragraph: z.string(),
  affirmation: z.string(),
})

// ---------- meditations-supersensory-powers.json ----------
//
// One meditation per major arcana key, extracted from Ann Davies'
// "Esoteric Extension of Tarot to Develop Supersensory Powers". Body
// text is split into paragraphs; affirmation is the closing AFFIRMATION
// block (may be empty for keys whose source section ends without one).
export const SupersensoryMeditationSchema = z.object({
  num: z.number().int().min(0).max(21),
  name: z.string(),
  slug: z.string(),
  paragraphs: z.array(z.string()),
  affirmation: z.string(),
})

// ---------- grades.json ----------
//
// The Golden Dawn grade ladder. Neophyte (0=0) sits outside the Tree of
// Life; the other ten grades each map to one sephirah. Each non-neophyte
// grade carries a Qabalistic "intelligence" name whose Hebrew letters
// spell out a path of tarot keys (looked up via tarot.json letter).
// ---------- chakras.json ----------
//
// Seven planetary chakras — each entry pairs a planet (by slug from
// planets.json), its presiding archangel, the alchemical metal, and
// the body center it governs. Stored in chakra order (root → crown)
// matching planets.json.
export const ChakraSchema = z.object({
  planet: z.string(),
  angel: z.string(),
  metal: z.string(),
  chakra: z.string(),
})

export const GradeSchema = z.object({
  slug: z.string(),
  name: z.string(),
  gradeNumber: z.string(),
  sephirah: z.string().nullable(),
  // English meaning of the intelligence (e.g. "Resplendent").
  intelligenceName: z.string().nullable(),
  // Phonetic transliteration of the Hebrew word for the intelligence
  // (e.g. "Mitnotzetz") — same role as `Sephirah.hebrewName`.
  intelligenceHebrew: z.string().nullable().optional(),
  // BOTA-style letter romanization of the Hebrew word (e.g. "MThNVTzO").
  // The list of Hebrew letters spelling the intelligence is derived
  // from this string at runtime via romanToLetters() — no need to keep
  // a separate `letters` array in sync.
  intelligenceRoman: z.string().nullable(),
})
