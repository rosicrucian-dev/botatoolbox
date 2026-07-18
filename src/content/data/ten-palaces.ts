// The Ten Palaces of Assiah — raw records from ten-palaces.json, in
// order (1 → 10). Each pairs a sphere with its Hebrew name. Shown on
// the Qabalah reference page. German display fields come from
// `de/ten-palaces.json` via getTenPalaces(locale); the top-level
// exports stay pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/en/ten-palaces.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { TenPalaceSchema } from './schemas'

export type TenPalace = z.infer<typeof TenPalaceSchema>

const rawFor = localizedRaw('ten-palaces', data)

export const getTenPalaces = defineLocalized((locale) => {
  const tenPalaces: ReadonlyArray<TenPalace> = z
    .array(TenPalaceSchema)
    .parse(rawFor(locale))
  return { tenPalaces }
})
