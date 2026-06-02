// Shared gematria lookup tables. Used by:
//   - the docs page (visual feedback as the user builds a sequence)
//   - the player page (turns a sequence into meditation slides)
//
// Sofit (final) forms inherit their base letter's value and tarot card
// (BOTA's simple-gematria convention).

import { cardByLetter, type TarotCard } from '@/content/data/tarot'
import { letters as hebrewLetters } from '@/lib/hebrew'

export const valueByGlyph: Record<string, number> = {}
export const cardByGlyph: Record<string, TarotCard | undefined> = {}

for (const [name, meta] of Object.entries(hebrewLetters)) {
  const card = cardByLetter[name]
  const value = card?.gematria ?? 0
  valueByGlyph[meta.glyph] = value
  cardByGlyph[meta.glyph] = card
  if (meta.sofit) {
    valueByGlyph[meta.sofit] = value
    cardByGlyph[meta.sofit] = card
  }
}

valueByGlyph[' '] = 0
