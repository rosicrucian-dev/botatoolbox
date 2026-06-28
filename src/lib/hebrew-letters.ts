// Pure Hebrew-letter primitives — the single source of truth for letter values,
// final-form folding, the consonantal skeleton, and BOTA romanization.
//
// This file has NO imports on purpose: no `@` aliases, no data. That lets the
// build-time gematria generator import it by relative path under
// `node --experimental-strip-types`, while the app imports it via `@/lib/…` —
// so the runtime and the generator can never disagree about letter math.

// Standard absolute gematria. Sofit (final) forms inherit their base value
// (BOTA's simple-gematria convention).
export const LETTER_VALUE: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10,
  כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70,
  פ: 80, ף: 80, צ: 90, ץ: 90, ק: 100, ר: 200, ש: 300, ת: 400,
}

// Final (sofit) form → base consonant.
export const FINAL_TO_BASE: Record<string, string> = {
  ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ',
}

// The 22 base consonants.
export const BASE_CONSONANTS: ReadonlySet<string> = new Set(
  'אבגדהוזחטיכלמנסעפצקרשת'.split(''),
)

// Glyph → BOTA romanization (sofits share their base letter's roman). Two-char
// codes (Ch/Sh/Th/Tz) round-trip via romanToLetters() in src/lib/hebrew.ts.
export const GLYPH_TO_ROMAN: Record<string, string> = {
  א: 'A', ב: 'B', ג: 'G', ד: 'D', ה: 'H', ו: 'V', ז: 'Z', ח: 'Ch',
  ט: 'T', י: 'I', כ: 'K', ך: 'K', ל: 'L', מ: 'M', ם: 'M', נ: 'N',
  ן: 'N', ס: 'S', ע: 'O', פ: 'P', ף: 'P', צ: 'Tz', ץ: 'Tz', ק: 'Q',
  ר: 'R', ש: 'Sh', ת: 'Th',
}

// Roman letter code → base glyph. Inverts GLYPH_TO_ROMAN for repairing the
// gematria source's "HB:X" markers (e.g. "HB:M" → מ).
export const ROMAN_TO_BASE_GLYPH: Record<string, string> = {
  A: 'א', B: 'ב', G: 'ג', D: 'ד', H: 'ה', V: 'ו', Z: 'ז', Ch: 'ח',
  T: 'ט', I: 'י', K: 'כ', L: 'ל', M: 'מ', N: 'נ', S: 'ס', O: 'ע',
  P: 'פ', Tz: 'צ', Q: 'ק', R: 'ר', Sh: 'ש', Th: 'ת',
}

// Consonantal skeleton: finals folded to base, everything else (niqqud, spaces,
// punctuation, Latin) dropped. "אֱלֹהִים" and "אלהימ" → "אלהימ". Used to match a
// typed/Crowley spelling against the dictionary regardless of vowels or finals.
export function skeleton(hebrew: string): string {
  let out = ''
  for (const ch of hebrew) {
    const base = FINAL_TO_BASE[ch] ?? ch
    if (BASE_CONSONANTS.has(base)) out += base
  }
  return out
}

// Gematria value of a Hebrew string; unknown characters contribute 0.
export function gematriaValue(hebrew: string): number {
  let sum = 0
  for (const ch of hebrew) sum += LETTER_VALUE[ch] ?? 0
  return sum
}

// BOTA romanization of a Hebrew string. Spaces are preserved (collapsed) so
// multi-word names romanize cleanly; unknown characters are dropped.
export function romanize(hebrew: string): string {
  let out = ''
  for (const ch of hebrew) out += ch === ' ' ? ' ' : (GLYPH_TO_ROMAN[ch] ?? '')
  return out.replace(/\s+/g, ' ').trim()
}
