// Minor Arcana — 56 cards across Wands, Cups, Swords, Pentacles.
// Edit `minor-arcana.json` for keyword/sign/dates/meaning; this module
// flattens the per-suit JSON into a list of cards with URL slugs and
// exposes the image-path helpers.

import { z } from 'zod'

import data from '@content/data/minor-arcana.json'

import { MinorSuitSchema } from './schemas'
import { byKey } from './helpers'

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
// "2-cups". Matches what scripts/optimize-tarot.ts writes to
// public/tarot/minor/.
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

// Default minor image is the colored set (third-party, downloaded into
// public/tarot/minor-colored/). Use `minorImageBW` explicitly when you
// want the official B&W version — currently the detail page does that
// since its caption references the storebota.org source.
export function minorImage(card: Pick<MinorEntry, 'slug'>): string {
  return `/tarot/minor-colored/${card.slug}.jpg`
}

export function minorImageBW(card: Pick<MinorEntry, 'slug'>): string {
  return `/tarot/minor/${card.slug}.jpg`
}

export function minorThumbImage(card: Pick<MinorEntry, 'slug'>): string {
  return `/tarot/minor/thumbs/${card.slug}.jpg`
}
