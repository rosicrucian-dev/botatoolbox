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
  // Shorter title used only on narrow (mobile) screens so the heading and
  // toolbar buttons fit on one row; desktop always uses `name`. Optional —
  // set only on cards whose full name is too long (e.g. "The High
  // Priestess" → "High Priestess").
  mobileTitle: z.string().optional(),
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

// ---------- texts.json ----------
//
// Manifest for the prose texts under content/texts/*.md. Adding a text is
// a .md file + one entry here — no code. The generic /texts/[slug] route
// renders any entry; `custom` entries (e.g. the Trestleboard, which has a
// player) keep their own route folder and are skipped by the generic one.
export const TextSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z
    .string()
    .optional()
    .describe('Shown on the home-page TOC card for this text.'),
  hidden: z
    .boolean()
    .optional()
    .describe(
      'Hidden from nav, home TOC, and sitemap; still reachable by direct URL.',
    ),
  custom: z
    .boolean()
    .optional()
    .describe(
      'The text has its own bespoke route folder (a code task); the generic /texts/[slug] renderer skips it and would 404. Leave unset for normal prose texts.',
    ),
})

// ---------- rituals.json ----------
//
// Manifest for the rituals under content/rituals/*.md. Adding a ritual is
// a .md file + one entry here — no code. The generic /rituals/[slug] route
// parses the markdown (## → section, `label. text` → step, word-of-power
// links) and renders the walkthrough.
export const RitualSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z
    .string()
    .optional()
    .describe('Shown on the home-page TOC card for this ritual.'),
  musicFileSlug: z
    .string()
    .optional()
    .describe(
      "Slug of the /files entry holding this ritual's music sheet; renders a reference link when set.",
    ),
  hasPlayer: z
    .boolean()
    .optional()
    .describe(
      'The ritual has a bespoke guided player at /rituals/<slug>/play. Building a player is a code task — only set this once that route exists.',
    ),
  hidden: z
    .boolean()
    .optional()
    .describe(
      'Hidden from nav, home TOC, and sitemap; still reachable by direct URL.',
    ),
})

// ---------- files.json ----------
//
// Downloadable files shown under /files, grouped by section. Section
// order on the index page = order of first occurrence in the array.

export const FileDownloadSchema = z.object({
  label: z.string(),
  src: z.string(),
})

export const FileEntrySchema = z.object({
  slug: z.string(),
  name: z.string(),
  src: z
    .string()
    .describe(
      "Image shown in the viewer. For PDFs this is a separate preview image, since an <img> can't render a PDF.",
    ),
  section: z.string(),
  description: z.string().optional(),
  downloads: z
    .array(FileDownloadSchema)
    .optional()
    .describe(
      'When present, the viewer shows one button per download instead of a single Download of `src` (e.g. A4 + Letter variants of a print).',
    ),
  direct: z
    .boolean()
    .optional()
    .describe(
      'Listed as a plain download link on the index page (no viewer page).',
    ),
  tableau: z
    .string()
    .optional()
    .describe(
      'When set, the viewer shows the major-arcana tableau spread in this art style (a Major style id from tarot-styles.ts) as the preview, instead of a single <img src>.',
    ),
  minorTableau: z
    .boolean()
    .optional()
    .describe(
      'When true, the viewer shows the 56 minor-arcana cards as a per-suit preview gallery (Josh Yates style) instead of a single <img src>.',
    ),
  rounded: z
    .boolean()
    .optional()
    .describe(
      'Set false to drop the rounded corners on the viewer preview image (e.g. for full-bleed art where rounding clips the corners).',
    ),
})

// ---------- cube-of-space.json ----------
//
// BOTA Cube of Space attributions: which major arcana card sits on each
// face and edge, and which way each edge's flow runs. Geometry (corner
// coordinates, 3D positions/rotations, half-card UV wraps) stays in code
// (CubeCanvas.tsx / scripts/gen-cube-pdf.ts) — this file holds only
// the attributions a contributor might need to correct.

export const CubeEdgeIdSchema = z
  .enum([
    'T-E',
    'T-N',
    'T-W',
    'T-S',
    'B-E',
    'B-N',
    'B-W',
    'B-S',
    'NE',
    'SE',
    'SW',
    'NW',
  ])
  .describe(
    'Edge position: T-*/B-* are the top/bottom horizontals of the named face; two-letter ids are the vertical corner edges.',
  )

export const CubeFlowDirectionSchema = z
  .enum(['north', 'south', 'east', 'west', 'up', 'down'])
  .describe(
    "Direction the edge's flow runs. Horizontal edges use compass words; vertical corner edges use up/down.",
  )

export const CubeEdgeSchema = z.object({
  id: CubeEdgeIdSchema,
  cardSlug: z
    .string()
    .describe(
      'Major arcana card (simple Hebrew letter / zodiac sign) attributed to this edge.',
    ),
  flow: CubeFlowDirectionSchema,
})

export const CubeFaceSchema = z.object({
  id: z.enum(['east', 'west', 'above', 'below', 'north', 'south']),
  cardSlug: z
    .string()
    .describe(
      'Major arcana card (double Hebrew letter / planet) attributed to this face.',
    ),
  borders: z
    .object({
      top: CubeEdgeIdSchema,
      bottom: CubeEdgeIdSchema,
      right: CubeEdgeIdSchema,
      left: CubeEdgeIdSchema,
    })
    .describe(
      'Which edge frames each side of this face, as seen facing the face from inside the cube.',
    ),
})

export const CubeOfSpaceSchema = z.object({
  edges: z.array(CubeEdgeSchema).length(12),
  faces: z.array(CubeFaceSchema).length(6),
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
  glyph: z.string().describe('Unicode astrological glyph (e.g. ♈).'),
  symbol: z
    .string()
    .describe('Iconic figure of the sign — Ram, Ox, Twins, etc.'),
  letter: z.string().describe('Hebrew letter attributed to this sign.'),
  bodyPart: z.string().describe('Body region governed by this sign.'),
  quality: z.enum(['Cardinal', 'Fixed', 'Mutable']),
  // Twelve-stage Magnum Opus: each sign owns one alchemical operation
  // in zodiac order — Calcination (Aries) → Projection (Pisces).
  alchemicalStage: z.string(),
  rulers: z.array(z.string()).describe('Planet slug(s) that rule this sign.'),
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
  glyph: z.string().describe('Unicode astrological glyph (e.g. ☉).'),
  letter: z.string().describe('Hebrew letter attributed to this planet.'),
  chakra: z
    .string()
    .optional()
    .describe(
      'Chakra meditated upon for this planet. Modern planets (Uranus/Neptune/Pluto) omit this.',
    ),
  rules: z.array(z.string()).describe('Sign slugs ruled by this planet.'),
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
// ---------- numerology.json ----------
//
// The ten BOTA single-digit numerological meanings. Each digit (0-9)
// gets one keyword; multi-digit numbers reduce to a single digit by
// summation. Pure attribution table — no foreign keys.
export const NumerologySchema = z.object({
  num: z.number().int().min(0).max(9),
  meaning: z.string(),
})

// ---------- elements.json ----------
//
// The four classical elements. Each carries the two Aristotelian
// qualities it expresses, the physical state it relates to, and its
// order of elemental spirits. The triangle glyph is NOT stored — it's
// derived from `slug` by the <ElementSymbol> component (see the "images
// derived, never stored" convention in content/data/README.md). Pure
// attribution table — no foreign keys.
export const ElementSchema = z.object({
  slug: z.string(),
  name: z.string(),
  quality: z.string(),
  relatingTo: z.string(),
  spirit: z.string(),
  kerub: z.string(),
})

// ---------- gunas.json ----------
//
// The three gunas of Sankhya philosophy, joined to their alchemical
// principle (the tria prima), classical element, mode of consciousness,
// and governing principle. The `glyph` is the Unicode alchemical symbol
// (sulfur / mercury / salt), stored directly as with planets/signs.
// Shown as a second table on the Elements reference page. No foreign
// keys.
export const GunaSchema = z.object({
  slug: z.string(),
  glyph: z.string(),
  guna: z.string(),
  color: z.string(),
  element: z.string(),
  alchemy: z.string(),
  consciousness: z.string(),
  principle: z.string(),
})

// ---------- houses.json ----------
//
// The twelve astrological houses — each pairs its number (1–12) with a
// description of the affairs it governs. Rendered as a glossary-style
// definition list at the bottom of the Astrology page. No foreign keys.
export const HouseSchema = z.object({
  num: z.number().int().min(1).max(12),
  definition: z.string(),
})

// ---------- alchemy.json ----------
//
// A glossary of alchemical terms — each entry pairs a term with its
// definition. Rendered as a definition list on the Alchemy reference
// page. Pure attribution table — no foreign keys.
export const AlchemyTermSchema = z.object({
  slug: z.string(),
  term: z.string(),
  definition: z.string(),
})

// ---------- three-veils.json ----------
//
// The Three Veils of Negative Existence that precede Kether on the Tree
// of Life. Each veil (1-3) pairs its Hebrew name with its English
// meaning. Pure attribution table — no foreign keys.
export const ThreeVeilSchema = z.object({
  num: z.number().int().min(1).max(3),
  name: z.string(),
  meaning: z.string(),
})

// ---------- four-worlds.json ----------
//
// The four Qabalistic worlds — each pairs its Hebrew name with its
// principle (Archetypal → Material) and the order of beings that
// manifest there. Shown as a table on the Qabalah reference page. No
// foreign keys.
export const FourWorldSchema = z.object({
  slug: z.string(),
  world: z.string(),
  principle: z.string(),
  beings: z.string(),
})

// ---------- suit-correspondences.json ----------
//
// The four tarot suits paired with their ordinary playing-card
// equivalents. Shown as a table at the top of the Minor Arcana page.
// (Distinct from the `suits` export in minor-arcana.ts, which is the
// full per-suit card list.) No foreign keys.
export const SuitCorrespondenceSchema = z.object({
  tarot: z.string(),
  playingCard: z.string(),
  world: z.string(),
  element: z.string(),
  letter: z.string(),
})

// ---------- pillars.json ----------
//
// The two pillars of the Tree of Life. Each entry is a bare
// [passive, active] pair of corresponding attributions — passive
// (left) first, active (right) second — with no keys, matching the
// two-column layout on the Qabalah reference page. Note this reverses
// the left/right of the source table by design.
export const PillarPairSchema = z.tuple([z.string(), z.string()])

// ---------- ten-palaces.json ----------
//
// The Ten Palaces of Assiah — the ten spheres of the material world
// (1 Primum Mobile → 10 Sphere of the Elements), each with its Hebrew
// name. Shown as a table on the Qabalah reference page. No foreign
// keys.
export const TenPalaceSchema = z.object({
  num: z.number().int().min(1).max(10),
  sphere: z.string(),
  name: z.string(),
})

// ---------- chakras.json ----------
//
// Seven planetary chakras — each entry pairs a planet (by slug from
// planets.json), its presiding archangel, the alchemical metal, the
// body center it governs, and the Church of Revelation it corresponds
// to. Stored in chakra order (root → crown) matching planets.json.
export const ChakraSchema = z.object({
  planet: z.string(),
  angel: z.string(),
  metal: z.string(),
  chakra: z.string(),
  church: z.string(),
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

// ---------- public/data/gematria-words.json ----------
//
// GENERATED by scripts/gen-gematria-words.ts from the vendored sources (Paul
// Case's number-keyed dictionaries, Crowley's Sepher Sephiroth, Strong's) — do
// not hand-edit. Unlike the other data files this is a number-keyed map
// (gematria value → that number's content, listed by source), and it's
// validated at build time rather than parsed at runtime. It's large, so it's
// served as a static file in /public and FETCHED on demand rather than bundled
// (see src/content/data/gematria-words.ts). The source registry lives in
// src/content/data/gematria-sources.ts.
// One word entry from one source: the Hebrew word as that source records it
// (pointed lemma for Strong's, plain consonants for Crowley), its gloss, and an
// optional reference id (e.g. Strong's "H259"). Every word-keyed source is a
// flat list of these — one word, one definition per row — so a single renderer
// serves them all. Homographs are separate rows, differentiated by `ref`.
export const GematriaWordSchema = z.object({
  hebrew: z.string(),
  // The gloss / definition. May be empty (a bare Crowley citation).
  text: z.string(),
  // Source reference id, e.g. Strong's "H259". Absent for Crowley.
  ref: z.string().optional(),
})

// A gematria number, listed BY SOURCE (nothing merged across sources):
//   - `notes` — number-keyed prose blocks, keyed by source id (Paul Case).
//   - `words` — word lists, keyed by source id (Crowley, Strong's).
// Source ids and render order come from src/content/data/gematria-sources.ts.
export const GematriaNumberEntrySchema = z.object({
  // The number's own Qabalistic note (e.g. "The Mystic Number of Chokmah"),
  // shown as a caption above the source sections.
  significance: z.string().optional(),
  // Number-keyed prose, keyed by source id → entry text.
  notes: z.record(z.string(), z.string()).optional(),
  // Word lists, keyed by source id → words at this value.
  words: z.record(z.string(), z.array(GematriaWordSchema)).optional(),
})

export const GematriaWordsSchema = z.record(
  z.string(),
  GematriaNumberEntrySchema,
)
