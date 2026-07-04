// The Three Veils of Negative Existence — raw records from
// three-veils.json, in order (AIN → AIN SOPH → AIN SOPH AUR). Each
// pairs the Hebrew name with its English meaning.

import { z } from 'zod'

import data from '@content/data/three-veils.json'

import { ThreeVeilSchema } from './schemas'

export type ThreeVeil = z.infer<typeof ThreeVeilSchema>

export const threeVeils: ReadonlyArray<ThreeVeil> = z
  .array(ThreeVeilSchema)
  .parse(data)
