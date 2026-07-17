// The four classical elements — raw records from elements.json, in the
// traditional Fire / Water / Air / Earth order. Each pairs its two
// Aristotelian qualities with the physical state it relates to. The
// triangle glyph is derived from the slug at render time, not stored.
// German display fields come from `de/elements.json` (see
// overlay-config.ts) via getElements(locale); the top-level exports
// stay pinned to English.

import { z } from 'zod'

import data from '@content/data/elements.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { ElementSchema } from './schemas'

export type Element = z.infer<typeof ElementSchema>

const rawFor = localizedRaw('elements', data)

export const getElements = defineLocalized((locale) => {
  const elements: ReadonlyArray<Element> = z
    .array(ElementSchema)
    .parse(rawFor(locale))

  return { elements }
})
