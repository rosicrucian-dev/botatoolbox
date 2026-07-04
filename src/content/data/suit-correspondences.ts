// Tarot suit ↔ playing-card equivalents — raw records from
// suit-correspondences.json. Shown as a table at the top of the Minor
// Arcana page. Distinct from `suits` in minor-arcana.ts.

import { z } from 'zod'

import data from '@content/data/suit-correspondences.json'

import { SuitCorrespondenceSchema } from './schemas'

export type SuitCorrespondence = z.infer<typeof SuitCorrespondenceSchema>

export const suitCorrespondences: ReadonlyArray<SuitCorrespondence> = z
  .array(SuitCorrespondenceSchema)
  .parse(data)
