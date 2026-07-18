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

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

import { overlayTargets } from '../src/content/data/overlay-config.ts'
import { DEFAULT_LOCALE, LOCALES } from '../src/lib/locales.ts'
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

const here = import.meta.dirname
const dataDir = join(here, '..', 'content', 'data')
const schemaDir = join(dataDir, '.schemas')
mkdirSync(schemaDir, { recursive: true })

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

// One schema per data file, shared by every locale: en/ and translated
// siblings have the SAME full shape (full-copy model), so the editor
// wiring below maps content/data/*/<file>.json to it with a glob. The
// generated sidecars live in content/data/.schemas/ to keep the data
// directories clean for translators.
for (const { file, schema } of targets) {
  const json = z.toJSONSchema(schema)
  const out = join(schemaDir, `${file}.schema.json`)
  writeFileSync(out, JSON.stringify(json, null, 2) + '\n')
  console.log(`wrote ${out}`)
}

// ---------- chrome-message schema (content/messages/*.json) ----------
//
// One schema shared by every locale's messages file. Enumerates every
// known message key (typed catalog + nav-derived) so the translator's
// editor flags typo'd or orphaned keys and non-string values.

const messageKeys = Object.keys(
  JSON.parse(
    readFileSync(
      join(here, '..', 'content', 'messages', `${DEFAULT_LOCALE}.json`),
      'utf8',
    ),
  ) as Record<string, string>,
)
{
  const json = z.toJSONSchema(
    z
      .object(
        Object.fromEntries(messageKeys.map((k) => [k, z.string().optional()])),
      )
      .strict(),
  )
  const out = join(here, '..', 'content', 'messages', 'messages.schema.json')
  writeFileSync(out, JSON.stringify(json, null, 2) + '\n')
  console.log(`wrote ${out}`)
}

const localizedFiles = new Set(overlayTargets.map((t) => t.file))

// Editor wiring, derived from the same lists so they can't drift.
const settingsPath = join(here, '..', '.vscode', 'settings.json')
const settings = {
  'json.schemas': [
    // One schema per data file. Language-carrying files live in the
    // locale dirs (the glob covers en/, de/, and any future locale);
    // language-free files (cube-of-space, tree-paths) sit top level.
    ...targets.map(({ file }) => ({
      fileMatch: [
        localizedFiles.has(file)
          ? `content/data/*/${file}.json`
          : `content/data/${file}.json`,
      ],
      url: `./content/data/.schemas/${file}.schema.json`,
    })),
    {
      fileMatch: [
        'content/messages/*.json',
        '!content/messages/*.schema.json',
      ],
      url: './content/messages/messages.schema.json',
    },
  ],
}
writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n')
console.log(`wrote ${settingsPath}`)
