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

import {
  TarotCardSchema,
  WordSchema,
  SignSchema,
  PlanetSchema,
  MinorSuitSchema,
  SephirahSchema,
  TreePathSchema,
  MeditationDaySchema,
  SupersensoryMeditationSchema,
  GradeSchema,
  ChakraSchema,
  ElementSchema,
  AlchemyTermSchema,
  GunaSchema,
  HouseSchema,
  ThreeVeilSchema,
  FourWorldSchema,
  PillarPairSchema,
  TenPalaceSchema,
  SuitCorrespondenceSchema,
  NumerologySchema,
  TextSchema,
  RitualSchema,
  CubeOfSpaceSchema,
  FileEntrySchema,
} from '../src/content/data/schemas.ts'

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

// Editor wiring, derived from the same list so the two can't drift.
const settingsPath = join(here, '..', '.vscode', 'settings.json')
const settings = {
  'json.schemas': targets.map(({ file }) => ({
    fileMatch: [`content/data/${file}.json`],
    url: `./content/data/${file}.schema.json`,
  })),
}
writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n')
console.log(`wrote ${settingsPath}`)
