// Glyph → tarot card join for the gematria tools. Server-only (imports
// @/content/data); pages pass the map to their client components as a
// prop so the datasets stay out of the client bundle. Sofit (final)
// forms inherit their base letter's card (BOTA's simple-gematria
// convention).

import { getTarot, type TarotCard } from '@/content/data'
import { letters } from '@/lib/hebrew'
import { type Locale } from '@/lib/locales'

export type CardByGlyph = Record<string, TarotCard | undefined>

export function cardByGlyph(locale: Locale): CardByGlyph {
  const { cardByLetter } = getTarot(locale)
  const out: CardByGlyph = {}
  for (const [name, meta] of Object.entries(letters)) {
    const card = cardByLetter[name]
    out[meta.glyph] = card
    if (meta.sofit) out[meta.sofit] = card
  }
  return out
}
