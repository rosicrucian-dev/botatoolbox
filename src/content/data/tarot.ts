// Tarot Major Arcana — 22 trumps with their BOTA attributions.
// Edit `tarot.json` to fix or add an attribution; this file is the typed
// view. German display fields come from `de/tarot.json` (see
// overlay-config.ts) via getTarot(locale); the top-level exports stay
// pinned to English for legacy consumers.

import { z } from 'zod'

import data from '@content/data/tarot.json'

import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { TarotCardSchema } from './schemas'
import { DEFAULT_MAJOR_STYLE } from './tarot-styles'

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

// Image URL for a major-arcana card, in the given art style. The file lives at
// /public/tarot/major/<style>/<num>-<slug>.jpg. Styles come from the registry
// in `tarot-styles.ts`; `style` defaults to the default style so non-reactive
// callers (and server render) get sensible output. Reactive callers pass the
// user's chosen style from `useTarotStyle()` (usually via <MajorImage>).
// Paralleled by `minorImage` in data/minor-arcana.ts. Locale-free: images
// are shared across languages (slugs/nums never translate).
export function cardImage(
  card: Pick<TarotCard, 'num' | 'slug'>,
  style: string = DEFAULT_MAJOR_STYLE,
): string {
  return `/tarot/major/${style}/${card.num}-${card.slug}.jpg`
}

// Half-size variant for the tableau (22 cards in a grid) and the tree of life.
// Same JPEG, resized by scripts/optimize-tarot.ts. Style-aware like cardImage.
export function thumbImage(
  card: Pick<TarotCard, 'num' | 'slug'>,
  style: string = DEFAULT_MAJOR_STYLE,
): string {
  return `/tarot/major/${style}/thumbs/${card.num}-${card.slug}.jpg`
}
