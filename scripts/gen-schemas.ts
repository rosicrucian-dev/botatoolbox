// Generates JSON Schemas alongside each user-editable JSON data file,
// PLUS the `.vscode/settings.json` that wires each JSON to its schema.
// (The data files are top-level arrays, so they can't carry a `$schema`
// pointer themselves; the fileMatch entries give non-developer
// contributors autocomplete + red-underline validation in the editor.)
//
// Run with: npm run gen:schemas
//
// Each entry below is one (json, schema) pair; the script writes
// `<name>.schema.json` alongside `<name>.json` and regenerates the
// editor wiring — this list is the single source of truth.

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

import { overlayTargets } from '../src/content/data/overlay-config.ts'
import {
  AlchemyTermSchema,
  ChakraSchema,
  CubeOfSpaceSchema,
  ElementSchema,
  FileEntrySchema,
  FourWorldSchema,
  GradeSchema,
  GunaSchema,
  HouseSchema,
  MeditationDaySchema,
  MinorSuitSchema,
  NumerologySchema,
  PillarPairSchema,
  PlanetSchema,
  RitualSchema,
  SephirahSchema,
  SignSchema,
  SuitCorrespondenceSchema,
  SupersensoryMeditationSchema,
  TarotCardSchema,
  TenPalaceSchema,
  TextSchema,
  ThreeVeilSchema,
  TreePathSchema,
  WordSchema,
} from '../src/content/data/schemas.ts'
import { en as chromeEnglish } from '../src/content/messages/en/index.ts'
import { DEFAULT_LOCALE, LOCALES } from '../src/lib/locales.ts'
import { navMessageEntries } from '../src/lib/nav-data.ts'

const here = import.meta.dirname
const dataDir = join(here, '..', 'content', 'data')

const targets = [
  { file: 'tarot', schema: z.array(TarotCardSchema) },
  { file: 'words', schema: z.array(WordSchema) },
  { file: 'signs', schema: z.array(SignSchema) },
  { file: 'planets', schema: z.array(PlanetSchema) },
  { file: 'minor-arcana', schema: z.array(MinorSuitSchema) },
  { file: 'sephiroth', schema: z.array(SephirahSchema) },
  { file: 'tree-paths', schema: z.array(TreePathSchema) },
  {
    file: 'meditations-tarot-fundamentals',
    schema: z.array(MeditationDaySchema),
  },
  {
    file: 'meditations-supersensory-powers',
    schema: z.array(SupersensoryMeditationSchema),
  },
  { file: 'grades', schema: z.array(GradeSchema) },
  { file: 'chakras', schema: z.array(ChakraSchema) },
  { file: 'elements', schema: z.array(ElementSchema) },
  { file: 'alchemy', schema: z.array(AlchemyTermSchema) },
  { file: 'houses', schema: z.array(HouseSchema) },
  { file: 'gunas', schema: z.array(GunaSchema) },
  { file: 'three-veils', schema: z.array(ThreeVeilSchema) },
  { file: 'four-worlds', schema: z.array(FourWorldSchema) },
  { file: 'pillars', schema: z.array(PillarPairSchema) },
  { file: 'ten-palaces', schema: z.array(TenPalaceSchema) },
  { file: 'suit-correspondences', schema: z.array(SuitCorrespondenceSchema) },
  { file: 'numerology', schema: z.array(NumerologySchema) },
  { file: 'texts', schema: z.array(TextSchema) },
  { file: 'rituals', schema: z.array(RitualSchema) },
  { file: 'cube-of-space', schema: CubeOfSpaceSchema },
  { file: 'files', schema: z.array(FileEntrySchema) },
]

for (const { file, schema } of targets) {
  const json = z.toJSONSchema(schema)
  const out = join(dataDir, `${file}.schema.json`)
  writeFileSync(out, JSON.stringify(json, null, 2) + '\n')
  console.log(`wrote ${out}`)
}

// ---------- translation-overlay schemas ----------
//
// One schema per content/data/<locale>/<file>.json (the translator-
// edited overlays; see overlay-config.ts + gen-translations.ts). Built
// from the SAME base schemas: pick the translatable fields, make them
// all optional, and wrap in the overlay's keying shape. The element
// schema for each file comes from the `targets` array above.

const elementSchemaByFile = new Map<string, z.ZodType>(
  targets.map(({ file, schema }) => [
    file,
    schema instanceof z.ZodArray ? (schema.element as z.ZodType) : schema,
  ]),
)

const overlayLocales = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

function overlaySchemaFor(target: (typeof overlayTargets)[number]): z.ZodType {
  const element = elementSchemaByFile.get(target.file)
  const { keying, fields } = target

  // pillars: tuple rows are replaced wholesale — the overlay is the
  // same shape as the English file.
  if (keying.kind === 'index' && target.file === 'pillars') {
    return z.array(PillarPairSchema)
  }

  if (!(element instanceof z.ZodObject)) {
    throw new Error(
      `gen-schemas: no object schema for overlay "${target.file}"`,
    )
  }

  const pick = Object.fromEntries(fields.map((f) => [f, true as const]))

  if (keying.kind === 'nested') {
    // minor-arcana: { "<suit>": { "<num>": {…fields} } }. The child
    // element schema lives under `childList`; `meaning` may be partial
    // (untranslated subfields fall back to English).
    const child = (element.shape as Record<string, z.ZodType>)[keying.childList]
    if (
      !(child instanceof z.ZodArray) ||
      !(child.element instanceof z.ZodObject)
    ) {
      throw new Error(`gen-schemas: bad childList for overlay "${target.file}"`)
    }
    let entry = child.element.pick(pick).partial()
    if ('meaning' in entry.shape) {
      const meaning = child.element.shape.meaning
      if (
        meaning instanceof z.ZodOptional &&
        meaning.unwrap() instanceof z.ZodObject
      ) {
        entry = entry.extend({
          meaning: (meaning.unwrap() as z.ZodObject).partial().optional(),
        })
      }
    }
    return z.record(z.string(), z.record(z.string(), entry))
  }

  const entry = element.pick(pick).partial()
  if (keying.kind === 'index') return z.array(entry)
  return z.record(z.string(), entry)
}

for (const locale of overlayLocales) {
  for (const target of overlayTargets) {
    const json = z.toJSONSchema(overlaySchemaFor(target))
    const out = join(dataDir, locale, `${target.file}.schema.json`)
    writeFileSync(out, JSON.stringify(json, null, 2) + '\n')
    console.log(`wrote ${out}`)
  }
}

// ---------- chrome-message schemas (content/messages/<locale>.json) ----------
//
// Enumerates every known message key (typed catalog + nav-derived) so
// the translator's editor flags typo'd or orphaned keys and non-string
// values.

const messageKeys = Object.keys({ ...chromeEnglish, ...navMessageEntries() })
for (const locale of overlayLocales) {
  const json = z.toJSONSchema(
    z
      .object(
        Object.fromEntries(messageKeys.map((k) => [k, z.string().optional()])),
      )
      .strict(),
  )
  const out = join(here, '..', 'content', 'messages', `${locale}.schema.json`)
  writeFileSync(out, JSON.stringify(json, null, 2) + '\n')
  console.log(`wrote ${out}`)
}

// Editor wiring, derived from the same lists so they can't drift.
const settingsPath = join(here, '..', '.vscode', 'settings.json')
const settings = {
  'json.schemas': [
    ...targets.map(({ file }) => ({
      fileMatch: [`content/data/${file}.json`],
      url: `./content/data/${file}.schema.json`,
    })),
    ...overlayLocales.flatMap((locale) =>
      overlayTargets.map(({ file }) => ({
        fileMatch: [`content/data/${locale}/${file}.json`],
        url: `./content/data/${locale}/${file}.schema.json`,
      })),
    ),
    ...overlayLocales.map((locale) => ({
      fileMatch: [`content/messages/${locale}.json`],
      url: `./content/messages/${locale}.schema.json`,
    })),
  ],
}
writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n')
console.log(`wrote ${settingsPath}`)
