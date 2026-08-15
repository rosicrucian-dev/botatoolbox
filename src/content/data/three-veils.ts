// The Three Veils of Negative Existence — raw records from
// three-veils.json, in order (AIN → AIN SOPH → AIN SOPH AUR). Each
// pairs the Hebrew name with its English meaning. German display fields
// come from `de/three-veils.json` via getThreeVeils(locale); the
// top-level exports stay pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/en/three-veils.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { ThreeVeilSchema } from './schemas'

export type ThreeVeil = z.infer<typeof ThreeVeilSchema>

const rawFor = localizedRaw('three-veils', data)

export const getThreeVeils = defineLocalized((locale) => {
  const threeVeils: ReadonlyArray<ThreeVeil> = z
    .array(ThreeVeilSchema)
    .parse(rawFor(locale))
  return { threeVeils }
})
