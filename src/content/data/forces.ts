// The seven forces — the pair of opposites each of the seven planets
// governs, from the Sepher Yetzirah's seven doubles, in the order the
// School of Ageless Wisdom's lesson names them (Section A 4). The rest
// of the Seven Forces table is joined from planets.json, chakras.json
// and the Keys, so this file carries the one column they do not.
//
// ENGLISH ONLY for now: there is no de/forces.json, because this table
// came in with the shared data repository and has never been
// translated. Registering 'forces' in overlay-config.ts is the one step
// that would make it translatable, and `gen-translations` would then
// emit the German sibling for a translator to edit.

import { z } from 'zod'

import data from '@content/data/en/forces.json'
import { ForceSchema } from '@content/data/schemas'

import { defineLocalized } from './localized'

export type Force = z.infer<typeof ForceSchema>

export const getForces = defineLocalized(() => {
  const forces: ReadonlyArray<Force> = z.array(ForceSchema).parse(data)

  return { forces }
})
