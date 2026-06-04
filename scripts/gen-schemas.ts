// Generates JSON Schemas alongside each user-editable JSON data file.
// VS Code / github.dev pick them up via the `$schema` pointer in each
// JSON, giving non-developer contributors autocomplete + red-underline
// validation in the editor.
//
// Run with: npm run gen:schemas
//
// Each entry below is one (json, schema) pair; the script writes
// `<name>.schema.json` alongside `<name>.json`.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
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
} from '../src/content/data/schemas.ts'

const here = dirname(fileURLToPath(import.meta.url))
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
]

for (const { file, schema } of targets) {
  const json = z.toJSONSchema(schema)
  const out = join(dataDir, `${file}.schema.json`)
  writeFileSync(out, JSON.stringify(json, null, 2) + '\n')
  console.log(`wrote ${out}`)
}
