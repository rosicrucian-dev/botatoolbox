// Typed accessor over the generated gematria dictionary
// (`content/data/gematria-words.json`, built by
// `scripts/build-gematria-words.ts` from Sepher Sephiroth).
//
// The JSON is value-indexed: keys are gematria totals (as strings),
// values list the Hebrew words/phrases summing to that total under this
// app's scheme. Importing it here, behind a small lookup, keeps the big
// inferred literal type out of the page and gives callers a clean shape.

import data from '@content/data/gematria-words.json'

export interface GematriaWord {
  hebrew: string
  // BOTA romanization (parseable by romanToLetters); unused in the v1 UI
  // but kept for future linking into the calculator.
  roman: string
  // Crowley's Sepher Sephiroth gloss (may be a bare citation or empty).
  crowley: string
  // Strong's definition for the same spelling, when one exists.
  strongs?: string
}

export interface GematriaNumberEntry {
  // The number's own Qabalistic note ("the Mystic Number of Chokmah",
  // etc.). Present for some numbers; not shown in the v1 UI.
  significance?: string
  words: Array<GematriaWord>
}

const dict = data as unknown as Record<string, GematriaNumberEntry>

// Words summing to `n`, or undefined if the dictionary has no entry.
export function wordsForNumber(n: number): GematriaNumberEntry | undefined {
  if (!Number.isInteger(n) || n <= 0) return undefined
  return dict[String(n)]
}

const FINAL_TO_BASE: Record<string, string> = {
  ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ',
}

// Consonantal skeleton: final forms folded to base, non-letters dropped.
// Lets a typed spelling (sofit forms, spaces) match the dictionary's
// base-form entries.
function skeleton(s: string): string {
  let out = ''
  for (const ch of s) {
    const base = FINAL_TO_BASE[ch] ?? ch
    if (base >= 'א' && base <= 'ת') out += base
  }
  return out
}

// The dictionary entry for a specific spelling at a known value, if the
// dictionary happens to contain that exact word. Used by the calculator
// to show the meaning of the word the user just built.
export function wordForSpelling(
  value: number,
  hebrew: string,
): GematriaWord | undefined {
  const entry = wordsForNumber(value)
  if (!entry) return undefined
  const target = skeleton(hebrew)
  if (!target) return undefined
  return entry.words.find((w) => skeleton(w.hebrew) === target)
}
