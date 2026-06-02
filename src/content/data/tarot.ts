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
// /public/tarot/major/<num>-<slug>.jpg. Paralleled by `minorImage` in
// data/index.ts; both halves of the deck live under /tarot/major/ and
// /tarot/minor/ for symmetry.
export function cardImage(card: Pick<TarotCard, 'num' | 'slug'>): string {
  return `/tarot/major/${card.num}-${card.slug}.jpg`
}

// Half-size variant for the tableau (22 cards in a grid) and the tree
// of life. Same JPEG, resized to 362px wide by scripts/optimize-tarot.ts.
export function thumbImage(card: Pick<TarotCard, 'num' | 'slug'>): string {
  return `/tarot/major/thumbs/${card.num}-${card.slug}.jpg`
}
