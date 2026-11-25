// The twelve stages of the Great Work, one to each sign of the zodiac,
// in the signs' own order, which is the Work's. `process` is a
// compression of the curriculum's own sentence, never a quotation of
// it. The Key is reached through the sign's letter and is not a column.
//
// ENGLISH ONLY for now, as forces.ts is, and for the same reason.

import { z } from 'zod'

import data from '@content/data/en/stages.json'
import { AlchemyStageSchema } from '@content/data/schemas'

import { defineLocalized } from './localized'

export type AlchemyStage = z.infer<typeof AlchemyStageSchema>

export const getStages = defineLocalized(() => {
  const stages: ReadonlyArray<AlchemyStage> = z
    .array(AlchemyStageSchema)
    .parse(data)

  return { stages }
})
