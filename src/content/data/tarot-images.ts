// Card-image URL builders. Split out of tarot.ts / minor-arcana.ts so
// client components (CardImage, the players) can import them without
// pulling the Zod/JSON data graph into the browser bundle — like
// tarot-styles.ts, this module must stay dependency-free apart from the
// style registry and type-only imports (which are erased at build).
//
// Locale-free: images are shared across languages (slugs/nums never
// translate).

import { DEFAULT_MAJOR_STYLE, DEFAULT_MINOR_STYLE } from './tarot-styles'

import type { MinorEntry } from './minor-arcana'
import type { TarotCard } from './tarot'

// Image URL for a major-arcana card, in the given art style. The file lives at
// /public/tarot/major/<style>/<num>-<slug>.jpg. Styles come from the registry
// in `tarot-styles.ts`; `style` defaults to the default style so non-reactive
// callers (and server render) get sensible output. Reactive callers pass the
// user's chosen style from `useTarotStyle()` (usually via <MajorImage>).
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

// Image URL for a minor-arcana card, in the given art style. Parallels
// cardImage above; files live at /public/tarot/minor/<style>/<slug>.jpg.
export function minorImage(
  card: Pick<MinorEntry, 'slug'>,
  style: string = DEFAULT_MINOR_STYLE,
): string {
  return `/tarot/minor/${style}/${card.slug}.jpg`
}
