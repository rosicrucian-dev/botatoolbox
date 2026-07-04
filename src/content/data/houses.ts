// The twelve astrological houses — raw records from houses.json, in
// order (1 → 12). Each pairs a house number with the affairs it
// governs. Rendered as a glossary on the Astrology page.

import { z } from 'zod'

import data from '@content/data/houses.json'

import { HouseSchema } from './schemas'

export type House = z.infer<typeof HouseSchema>

export const houses: ReadonlyArray<House> = z.array(HouseSchema).parse(data)
