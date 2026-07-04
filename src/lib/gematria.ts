// Shared gematria lookup tables. Used by:
//   - the docs page (visual feedback as the user builds a sequence)
//   - the player page (turns a sequence into meditation slides)
//
// Sofit (final) forms inherit their base letter's value and tarot card
// (BOTA's simple-gematria convention).

// Direct submodule import — this file sits under the data layer via
// lib/hebrew (see the note there), so it avoids the barrel too.
import { cardByLetter, type TarotCard } from '@/content/data/tarot'
import { letters as hebrewLetters } from '@/lib/hebrew'
import { LETTER_VALUE } from '@/lib/hebrew-letters'

// Letter values come from the shared core (LETTER_VALUE) — the same table the
// dictionary generator uses — so a built word's total always matches the
// dictionary's buckets. The tarot card is looked up separately for the glyph.
export const valueByGlyph: Record<string, number> = { ...LETTER_VALUE, ' ': 0 }
export const cardByGlyph: Record<string, TarotCard | undefined> = {}

for (const [name, meta] of Object.entries(hebrewLetters)) {
  const card = cardByLetter[name]
  cardByGlyph[meta.glyph] = card
  if (meta.sofit) cardByGlyph[meta.sofit] = card
}

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
