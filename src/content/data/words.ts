// Words of power — the intoned divine names and their letter breakdowns.
// German display fields come from `de/words.json` (see overlay-config.ts)
// via getWords(locale); the top-level exports stay pinned to English.

import { z } from 'zod'

import wordsData from '@content/data/words.json'
import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { WordLetterSchema, WordSchema } from './schemas'

export type Word = z.infer<typeof WordSchema>
export type WordLetter = z.infer<typeof WordLetterSchema>

const rawFor = localizedRaw('words', wordsData)

export const getWords = defineLocalized((locale) => {
  const words: ReadonlyArray<Word> = z.array(WordSchema).parse(rawFor(locale))

  const wordBySlug = byKey(words, 'slug', 'word.slug')

  return { words, wordBySlug }
})
