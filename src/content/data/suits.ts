// The four tarot suits — raw records from suits.json: each suit's
// ordinary playing-card equivalent, its World, its element and its
// letter of the Tetragrammaton. Shown as a table at the foot of the
// Major Arcana page.
//
// DISTINCT from `suits` in minor-arcana.ts, which is a suit WITH its
// fourteen cards; this is the suit itself. German display fields come
// from `de/suits.json` via getSuits(locale).

import { z } from 'zod'

import data from '@content/data/en/suits.json'

import { SuitSchema } from '@content/data/schemas'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'

export type Suit = z.infer<typeof SuitSchema>

const rawFor = localizedRaw('suits', data)

export const getSuits = defineLocalized((locale) => {
  const suits: ReadonlyArray<Suit> = z.array(SuitSchema).parse(rawFor(locale))
  return { suits }
})
