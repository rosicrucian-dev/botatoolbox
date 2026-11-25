// Builds the Freeform deck manifest for a locale — the slim, serializable
// slice of the tarot data the client tabletop needs (image path parts +
// localized alt text). Server-only: this is the one Freeform module that
// touches @/content/data; pages pass its result to FreeformClient as a
// prop so the datasets stay out of the client bundle.

import { getMinorArcana, getTarot } from '@/content/data'
import { type DeckCard } from '@/lib/freeform'
import { type Locale } from '@/lib/locales'

export function freeformDeck(locale: Locale): ReadonlyArray<DeckCard> {
  return [
    ...getTarot(locale).cards.map(
      (c): DeckCard => ({
        slug: c.slug,
        kind: 'major',
        num: c.num,
        name: c.name,
      }),
    ),
    ...getMinorArcana(locale).minorCards.map(
      (c): DeckCard => ({
        slug: c.slug,
        kind: 'minor',
        name: `${c.num} of ${c.suit}`,
      }),
    ),
  ]
}
