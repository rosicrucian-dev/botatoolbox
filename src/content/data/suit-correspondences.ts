// Tarot suit ↔ playing-card equivalents — raw records from
// suit-correspondences.json. Shown as a table at the top of the Minor
// Arcana page. Distinct from `suits` in minor-arcana.ts. German display
// fields come from `de/suit-correspondences.json` via
// getSuitCorrespondences(locale); the top-level exports stay pinned to
// English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/en/suit-correspondences.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { SuitCorrespondenceSchema } from './schemas'

export type SuitCorrespondence = z.infer<typeof SuitCorrespondenceSchema>

const rawFor = localizedRaw('suit-correspondences', data)

export const getSuitCorrespondences = defineLocalized((locale) => {
  const suitCorrespondences: ReadonlyArray<SuitCorrespondence> = z
    .array(SuitCorrespondenceSchema)
    .parse(rawFor(locale))
  return { suitCorrespondences }
})
