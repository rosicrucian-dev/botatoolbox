// A glossary of alchemical terms — raw records from alchemy.json, in
// authored order. Each pairs a term with its definition; rendered as a
// definition list on the Alchemy reference page.

import { z } from 'zod'

import data from '@content/data/alchemy.json'

import { AlchemyTermSchema } from './schemas'

export type AlchemyTerm = z.infer<typeof AlchemyTermSchema>

export const alchemyTerms: ReadonlyArray<AlchemyTerm> = z
  .array(AlchemyTermSchema)
  .parse(data)
