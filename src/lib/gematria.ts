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

// --- Number-only transforms (the dictionary's "Numbers" cards) ---
// Pure math on a value; no word needed.

// The Nth triangular number, 1 + 2 + … + n (theosophic extension).
export function theosophicExtension(n: number): number {
  return (n * (n + 1)) / 2
}

// Successive digit-sums down to a single figure (theosophic reduction /
// digital root).
export function theosophicReduction(n: number): number {
  let cur = n
  while (cur > 9) {
    cur = String(cur)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0)
  }
  return cur
}
