// Display-field registry — the single source of truth for WHAT is
// translatable in each data file and HOW its entries are keyed. Three
// things consume it, so they can never drift:
//
//   - overlay.ts               — merges a locale's full-copy file over
//                                the English master at module load
//   - scripts/gen-translations.ts — emits/resyncs the translated
//                                sibling files the translator edits
//   - scripts/gen-schemas.ts   — emits the shared .schemas/ sidecars
//
// Design rules:
//   - content/data/en/ is the single source of truth for structure:
//     slugs, nums, foreign keys, glyphs, Hebrew romanizations, and any
//     field used as a lookup key (e.g. `color` feeds getColor(), and
//     `astrology`/`letter` are cross-checked by integrity.ts). None of
//     those are listed below — which is exactly what makes them inert
//     in a translated file: the merge only reads listed fields.
//   - Translated files are FULL sibling copies; anything missing or
//     mismatched falls back to English, so a partial translation always
//     ships.
//   - Translator mistakes warn at build/dev time (see overlay.ts) but
//     never fail the build — a translator PR can't break the site.

export type OverlayKeying =
  /** Entries keyed by a stable field: overlay is { "<key>": {…fields} }. */
  | { kind: 'field'; field: string }
  /**
   * Keyless tables merged by position: overlay is an array, same order
   * and length as the English file. Entries that are themselves arrays
   * (pillars' [passive, active] tuples) are replaced wholesale.
   */
  | { kind: 'index' }
  /**
   * Two-level files (minor-arcana): entries grouped by `groupBy`, then
   * keyed by `childKey` within the group's `childList` array. Overlay is
   * { "<group>": { "<childKey>": {…fields} } }.
   */
  | { kind: 'nested'; groupBy: string; childList: string; childKey: string }

export interface OverlayTarget {
  /** Basename under content/data/, without .json. */
  file: string
  keying: OverlayKeying
  /**
   * Translatable fields. A string field is replaced; an object field
   * (minor-arcana `meaning`) is merged subkey-by-subkey; an array field
   * (`paragraphs`) is replaced wholesale. Fields absent from the English
   * entry are skipped with a warning.
   */
  fields: readonly string[]
}

const slug = { kind: 'field', field: 'slug' } as const
const num = { kind: 'field', field: 'num' } as const

export const overlayTargets: readonly OverlayTarget[] = [
  {
    file: 'tarot',
    keying: slug,
    fields: ['name', 'significance', 'intelligence', 'power', 'human'],
  },
  {
    file: 'minor-arcana',
    keying: {
      kind: 'nested',
      groupBy: 'suit',
      childList: 'cards',
      childKey: 'num',
    },
    fields: ['keyword', 'sign', 'dates', 'meaning'],
  },
  { file: 'words', keying: slug, fields: ['english', 'meaning'] },
  {
    file: 'sephiroth',
    keying: slug,
    fields: [
      'name',
      'element',
      'situationOnTree',
      'briaticColors',
      'astrological',
      'gods',
      'magicalImage',
      'symbols',
      'tarotMinors',
      'microcosm',
      'bodyCorrespondence',
      'perfumes',
      'stones',
      'animals',
    ],
  },
  // `name` is translatable here because the tarot join runs on slug
  // (see astrology.ts) and integrity checks run on the English data.
  {
    file: 'signs',
    keying: slug,
    fields: ['name', 'symbol', 'bodyPart', 'alchemicalStage'],
  },
  { file: 'planets', keying: slug, fields: ['name', 'chakra'] },
  {
    file: 'meditations-tarot-fundamentals',
    keying: { kind: 'field', field: 'day' },
    fields: ['paragraph', 'affirmation'],
  },
  {
    file: 'meditations-supersensory-powers',
    keying: slug,
    fields: ['name', 'paragraphs', 'affirmation'],
  },
  { file: 'grades', keying: slug, fields: ['name', 'intelligenceName'] },
  {
    file: 'chakras',
    keying: { kind: 'field', field: 'planet' },
    fields: ['angel', 'metal', 'chakra', 'church'],
  },
  {
    file: 'elements',
    keying: slug,
    fields: ['name', 'quality', 'relatingTo', 'spirit', 'kerub'],
  },
  {
    file: 'gunas',
    keying: slug,
    fields: ['element', 'alchemy', 'consciousness', 'principle'],
  },
  { file: 'houses', keying: num, fields: ['definition'] },
  { file: 'numerology', keying: num, fields: ['meaning'] },
  { file: 'three-veils', keying: num, fields: ['meaning'] },
  { file: 'four-worlds', keying: slug, fields: ['principle', 'beings'] },
  {
    file: 'suit-correspondences',
    keying: { kind: 'index' },
    fields: ['tarot', 'playingCard', 'element'],
  },
  { file: 'pillars', keying: { kind: 'index' }, fields: [] },
  { file: 'ten-palaces', keying: num, fields: ['sphere'] },
  { file: 'alchemy', keying: slug, fields: ['term', 'definition'] },
  { file: 'texts', keying: slug, fields: ['title', 'description'] },
  { file: 'rituals', keying: slug, fields: ['title', 'description'] },
  { file: 'files', keying: slug, fields: ['name', 'description', 'section'] },
  // Deliberately absent (nothing translatable): cube-of-space,
  // tree-paths, tarot-styles, gematria data.
]

export const overlayTargetByFile: ReadonlyMap<string, OverlayTarget> = new Map(
  overlayTargets.map((t) => [t.file, t]),
)
