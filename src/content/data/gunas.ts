// The three gunas — raw records from gunas.json, joined to their
// alchemical principle, element, consciousness, and governing
// principle. Shown as a second table on the Elements reference page.
// German display fields come from `de/gunas.json` (see
// overlay-config.ts) via getGunas(locale); the top-level exports stay
// pinned to English.

import { z } from 'zod'

import data from '@content/data/en/gunas.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { GunaSchema } from './schemas'

export type Guna = z.infer<typeof GunaSchema>

const rawFor = localizedRaw('gunas', data)

export const getGunas = defineLocalized((locale) => {
  const gunas: ReadonlyArray<Guna> = z.array(GunaSchema).parse(rawFor(locale))

  return { gunas }
})
