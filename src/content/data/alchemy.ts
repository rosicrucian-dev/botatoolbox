// A glossary of alchemical terms — raw records from alchemy.json, in
// authored order. Each pairs a term with its definition; rendered as a
// definition list on the Alchemy reference page. German display fields
// come from `de/alchemy.json` via getAlchemy(locale); the top-level
// exports stay pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/alchemy.json'

import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { AlchemyTermSchema } from './schemas'

export type AlchemyTerm = z.infer<typeof AlchemyTermSchema>

const rawFor = localizedRaw('alchemy', data)

export const getAlchemy = defineLocalized((locale) => {
  const alchemyTerms: ReadonlyArray<AlchemyTerm> = z
    .array(AlchemyTermSchema)
    .parse(rawFor(locale))
  return { alchemyTerms }
})
