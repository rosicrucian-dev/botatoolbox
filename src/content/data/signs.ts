// Zodiac signs — raw records from signs.json (healing/body-part data,
// rulers, exaltations). For the tarot-joined view used by the astrology
// pages, see ./astrology.ts (astrologySigns).

import { z } from 'zod'

import signsData from '@content/data/signs.json'
import { SignSchema } from './schemas'

export type HealingSign = z.infer<typeof SignSchema>

// Zodiac glyphs (U+2648–U+2653) default to full-color emoji presentation
// on Apple platforms. Appending U+FE0E (variation selector-15) forces the
// monochrome text symbol. Doing it once here means EVERY consumer — the
// astrology tables, the focus player, the quiz, and the chart wheel — gets
// the plain text glyph instead of an emoji. Kept out of signs.json so the
// raw data stays a clean codepoint per sign.
const TEXT_VS = '\uFE0E'

export const signs: ReadonlyArray<HealingSign> = z
  .array(SignSchema)
  .parse(signsData)
  .map((s) => ({ ...s, glyph: s.glyph + TEXT_VS }))
