// Planetary chakra table — see schemas.ChakraSchema for shape. Each
// row references a planet by slug; planet cross-refs are checked in
// integrity.ts.

import { z } from 'zod'

import data from '@content/data/chakras.json'

import { ChakraSchema } from './schemas'

export type Chakra = z.infer<typeof ChakraSchema>

export const chakras: ReadonlyArray<Chakra> = z.array(ChakraSchema).parse(data)
