// The Ten Palaces of Assiah — raw records from ten-palaces.json, in
// order (1 → 10). Each pairs a sphere with its Hebrew name. Shown on
// the Qabalah reference page.

import { z } from 'zod'

import data from '@content/data/ten-palaces.json'

import { TenPalaceSchema } from './schemas'

export type TenPalace = z.infer<typeof TenPalaceSchema>

export const tenPalaces: ReadonlyArray<TenPalace> = z
  .array(TenPalaceSchema)
  .parse(data)
