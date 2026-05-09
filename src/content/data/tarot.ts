// Tarot Major Arcana — 22 trumps with their BOTA attributions.
// Edit `tarot.json` to fix or add an attribution; this file is the typed
// view.

import { z } from 'zod'

import data from '@content/data/tarot.json'
import { TarotCardSchema } from './schemas'

export type TarotCard = z.infer<typeof TarotCardSchema>

export const cards: ReadonlyArray<TarotCard> = z
  .array(TarotCardSchema)
  .parse(data)

export const cardBySlug = Object.fromEntries(
  cards.map((c) => [c.slug, c]),
) as Record<string, TarotCard>

export const cardByLetter = Object.fromEntries(
  cards.map((c) => [c.letter, c]),
) as Record<string, TarotCard>

export const cardByAstrology = Object.fromEntries(
  cards.map((c) => [c.astrology.toLowerCase(), c]),
) as Record<string, TarotCard>

// Image URL for a card — derived from num + slug. The file lives at
// /public/tarot/<num>-<slug>.jpg.
export function cardImage(card: Pick<TarotCard, 'num' | 'slug'>): string {
  return `/tarot/${card.num}-${card.slug}.jpg`
}
