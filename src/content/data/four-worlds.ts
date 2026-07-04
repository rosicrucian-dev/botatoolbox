// The four Qabalistic worlds — raw records from four-worlds.json, in
// descending order (Atziluth → Assiah). Each pairs a world with its
// nature and the order of beings that manifest there. Shown on the
// Qabalah reference page.

import { z } from 'zod'

import data from '@content/data/four-worlds.json'

import { FourWorldSchema } from './schemas'

export type FourWorld = z.infer<typeof FourWorldSchema>

export const fourWorlds: ReadonlyArray<FourWorld> = z
  .array(FourWorldSchema)
  .parse(data)
