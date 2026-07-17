// The twelve astrological houses — raw records from houses.json, in
// order (1 → 12). Each pairs a house number with the affairs it
// governs. Rendered as a glossary on the Astrology page. German display
// fields come from `de/houses.json` via getHouses(locale); the
// top-level exports stay pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/houses.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { HouseSchema } from './schemas'

export type House = z.infer<typeof HouseSchema>

const rawFor = localizedRaw('houses', data)

export const getHouses = defineLocalized((locale) => {
  const houses: ReadonlyArray<House> = z
    .array(HouseSchema)
    .parse(rawFor(locale))
  return { houses }
})
