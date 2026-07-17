// The two pillars of the Tree of Life — raw records from pillars.json.
// Each row is a bare [passive, active] pair (passive left, active
// right). Shown as a two-column table on the Qabalah reference page.
// German display fields come from `de/pillars.json` (a same-shape array
// merged by position) via getPillars(locale); the top-level exports
// stay pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/pillars.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { PillarPairSchema } from './schemas'

export type PillarPair = z.infer<typeof PillarPairSchema>

const rawFor = localizedRaw('pillars', data)

export const getPillars = defineLocalized((locale) => {
  const pillars: ReadonlyArray<PillarPair> = z
    .array(PillarPairSchema)
    .parse(rawFor(locale))
  return { pillars }
})
