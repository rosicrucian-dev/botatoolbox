// Planetary chakra table — see schemas.ChakraSchema for shape. Each
// row references a planet by slug; planet cross-refs are checked in
// integrity.ts. German display fields come from `de/chakras.json` (see
// overlay-config.ts) via getChakras(locale); the top-level exports stay
// pinned to English.

import { z } from 'zod'

import data from '@content/data/en/chakras.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { ChakraSchema } from './schemas'

export type Chakra = z.infer<typeof ChakraSchema>

const rawFor = localizedRaw('chakras', data)

export const getChakras = defineLocalized((locale) => {
  const chakras: ReadonlyArray<Chakra> = z
    .array(ChakraSchema)
    .parse(rawFor(locale))

  return { chakras }
})
