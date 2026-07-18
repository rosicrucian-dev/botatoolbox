// Tarot Major Arcana — 22 trumps with their BOTA attributions.
// Edit `tarot.json` to fix or add an attribution; this file is the typed
// view. German display fields come from `de/tarot.json` (see
// overlay-config.ts) via getTarot(locale); the top-level exports stay
// pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/en/tarot.json'

import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { TarotCardSchema } from './schemas'

export type TarotCard = z.infer<typeof TarotCardSchema>

const rawFor = localizedRaw('tarot', data)

export const getTarot = defineLocalized((locale) => {
  const cards: ReadonlyArray<TarotCard> = z
    .array(TarotCardSchema)
    .parse(rawFor(locale))

  const cardBySlug = byKey(cards, 'slug', 'card.slug')
  const cardByLetter = byKey(cards, 'letter', 'card.letter')

  // Resolve a route [slug] to a major card — accepts either the named
  // slug ('the-magician') or the numeric alias ('1'). Used by the
  // /tarot/[slug] pages, which serve a card under both forms.
  function cardBySlugOrNum(slug: string): TarotCard | undefined {
    if (/^\d+$/.test(slug)) return cards.find((c) => c.num === Number(slug))
    return cardBySlug[slug]
  }

  // Astrology lookup is case-insensitive — keys are lowercased so callers
  // can pass mixed-case names from JSON without normalizing first.
  const cardByAstrology: Record<string, TarotCard> = Object.freeze(
    Object.fromEntries(cards.map((c) => [c.astrology.toLowerCase(), c])),
  )

  return { cards, cardBySlug, cardByLetter, cardBySlugOrNum, cardByAstrology }
})

// Image helpers live in tarot-images.ts (dependency-free so client
// components can import them without the data graph); re-exported here
// to keep the barrel surface unchanged.
export { cardImage, thumbImage } from './tarot-images'
