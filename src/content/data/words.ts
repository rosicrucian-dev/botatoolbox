// Words of power — the intoned divine names and their letter breakdowns.

import { z } from 'zod'

import wordsData from '@content/data/words.json'
import { byKey } from './helpers'
import { WordLetterSchema, WordSchema } from './schemas'

export type Word = z.infer<typeof WordSchema>
export type WordLetter = z.infer<typeof WordLetterSchema>

export const words: ReadonlyArray<Word> = z.array(WordSchema).parse(wordsData)

export const wordBySlug = byKey(words, 'slug', 'word.slug')
