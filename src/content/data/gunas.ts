// The three gunas — raw records from gunas.json, joined to their
// alchemical principle, element, consciousness, and governing
// principle. Shown as a second table on the Elements reference page.

import { z } from 'zod'

import data from '@content/data/gunas.json'

import { GunaSchema } from './schemas'

export type Guna = z.infer<typeof GunaSchema>

export const gunas: ReadonlyArray<Guna> = z.array(GunaSchema).parse(data)
