// Minor Arcana — 56 cards across Wands, Cups, Swords, Pentacles.
// Edit `minor-arcana.json` for keyword/sign/dates/meaning; this module
// flattens the per-suit JSON into a list of cards with URL slugs and
// exposes the image-path helpers.

import { z } from 'zod'

import data from '@content/data/minor-arcana.json'

import { byKey } from './helpers'
import { MinorSuitSchema } from './schemas'
import { DEFAULT_MINOR_STYLE } from './tarot-styles'

export const suits = z.array(MinorSuitSchema).parse(data)

export interface MinorMeaning {
  intro: string
  wellDignified: string
  illDignified: string
}

export interface MinorEntry {
  slug: string
  suit: string
  num: string
  keyword: string
  sign?: string
  dates?: string
  meaning?: MinorMeaning
}

// Slug pattern: `<num-lower>-<suit-lower>`, e.g. "ace-cups" or
// "2-cups". Matches the filenames under public/tarot/minor/<style>/.
export const minorCards: ReadonlyArray<MinorEntry> = suits.flatMap((s) =>
  s.cards.map((c) => ({
    slug: `${c.num.toLowerCase()}-${s.suit.toLowerCase()}`,
    suit: s.suit,
    num: c.num,
    keyword: c.keyword,
    sign: c.sign,
    dates: c.dates,
    meaning: c.meaning,
  })),
)

export const minorBySlug = byKey(minorCards, 'slug', 'minor.slug')

// Image URL for a minor-arcana card, in the given art style. The file lives at
// /public/tarot/minor/<style>/<slug>.jpg. `style` defaults to the default
// minor style; reactive callers pass the user's choice from `useTarotStyle()`
// (usually via <MinorImage>). See `tarot-styles.ts`.
export function minorImage(
  card: Pick<MinorEntry, 'slug'>,
  style: string = DEFAULT_MINOR_STYLE,
): string {
  return `/tarot/minor/${style}/${card.slug}.jpg`
}
