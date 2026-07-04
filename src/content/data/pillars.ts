// The two pillars of the Tree of Life — raw records from pillars.json.
// Each row is a bare [passive, active] pair (passive left, active
// right). Shown as a two-column table on the Qabalah reference page.

import { z } from 'zod'

import data from '@content/data/pillars.json'

import { PillarPairSchema } from './schemas'

export type PillarPair = z.infer<typeof PillarPairSchema>

export const pillars: ReadonlyArray<PillarPair> = z
  .array(PillarPairSchema)
  .parse(data)
