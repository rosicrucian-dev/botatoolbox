// 12-key chromatic keyboard — derived from the 12 simple Hebrew letters
// (those attributed to the zodiac signs in BOTA's system). Each simple
// letter has a note and a color in tarot.json; this module just filters
// and sorts. Glyphs come from src/lib/hebrew.ts.
//
// This is a structural / UI concern, not editable attribution data —
// hence it lives in /lib, not /data.

import { getTarot } from '@/content/data'
import { letters as glyphMap } from '@/lib/hebrew'
import { DEFAULT_LOCALE } from '@/lib/locales'

// Note/color/letter are language-neutral attributions — English on
// purpose (the keyboard shows glyphs and notes, not card names).
const { cards } = getTarot(DEFAULT_LOCALE)

const ZODIAC = new Set([
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
])

const NOTE_ORDER = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export interface Key {
  note: string
  letter: string
  glyph: string
  color: string
  isWhite: boolean
}

export const keys: Array<Key> = cards
  .filter((c) => ZODIAC.has(c.astrology))
  .map((c) => ({
    note: c.note,
    letter: c.letter,
    glyph: glyphMap[c.letter]?.glyph ?? '?',
    color: c.color,
    isWhite: !c.note.includes('#'),
  }))
  .sort(
    (a, b) =>
      NOTE_ORDER.indexOf(a.note as (typeof NOTE_ORDER)[number]) -
      NOTE_ORDER.indexOf(b.note as (typeof NOTE_ORDER)[number]),
  )
