// BOTA numerological keywords for digits 0–9. Edit `numerology.json`
// to refine the keywords; this module is the typed view.

import { z } from 'zod'

import data from '@content/data/numerology.json'

import { NumerologySchema } from './schemas'

export type NumerologyEntry = z.infer<typeof NumerologySchema>

export const numerology: ReadonlyArray<NumerologyEntry> = z
  .array(NumerologySchema)
  .parse(data)
