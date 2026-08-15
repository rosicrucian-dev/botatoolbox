// The four Qabalistic worlds — raw records from four-worlds.json, in
// descending order (Atziluth → Assiah). Each pairs a world with its
// nature and the order of beings that manifest there. Shown on the
// Qabalah reference page. German display fields come from
// `de/four-worlds.json` via getFourWorlds(locale); the top-level
// exports stay pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/en/four-worlds.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { FourWorldSchema } from './schemas'

export type FourWorld = z.infer<typeof FourWorldSchema>

const rawFor = localizedRaw('four-worlds', data)

export const getFourWorlds = defineLocalized((locale) => {
  const fourWorlds: ReadonlyArray<FourWorld> = z
    .array(FourWorldSchema)
    .parse(rawFor(locale))
  return { fourWorlds }
})
