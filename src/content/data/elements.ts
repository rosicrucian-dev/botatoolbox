// The four classical elements — raw records from elements.json, in the
// traditional Fire / Water / Air / Earth order. Each pairs its two
// Aristotelian qualities with the physical state it relates to. The
// triangle glyph is derived from the slug at render time, not stored.

import { z } from 'zod'

import data from '@content/data/elements.json'

import { ElementSchema } from './schemas'

export type Element = z.infer<typeof ElementSchema>

export const elements: ReadonlyArray<Element> = z
  .array(ElementSchema)
  .parse(data)
