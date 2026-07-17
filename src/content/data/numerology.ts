// BOTA numerological keywords for digits 0–9. Edit `numerology.json`
// to refine the keywords; this module is the typed view. German display
// fields come from `de/numerology.json` via getNumerology(locale); the
// top-level exports stay pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/numerology.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { NumerologySchema } from './schemas'

export type NumerologyEntry = z.infer<typeof NumerologySchema>

const rawFor = localizedRaw('numerology', data)

export const getNumerology = defineLocalized((locale) => {
  const numerology: ReadonlyArray<NumerologyEntry> = z
    .array(NumerologySchema)
    .parse(rawFor(locale))
  return { numerology }
})
