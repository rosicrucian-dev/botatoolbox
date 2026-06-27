// Gematria dictionary — a value-indexed map of Hebrew words/phrases
// (Sepher Sephiroth + Strong's). GENERATED: the JSON is built by
// `scripts/build-gematria-words.ts`; edit the sources under
// `scripts/vendor/`, not the JSON. See content/data/generated/README.md.
//
// Unlike the other data modules this one does NOT `.parse()` at runtime —
// the file is large and ships to the client, so it's validated once at
// build time (inside the generator) instead. Types come from the Zod
// schema so they stay in sync regardless.

import { z } from 'zod'

import data from '@content/data/generated/gematria-words.json'
import {
  GematriaWordSchema,
  GematriaNumberEntrySchema,
} from './schemas'

export type GematriaWord = z.infer<typeof GematriaWordSchema>
export type GematriaNumberEntry = z.infer<typeof GematriaNumberEntrySchema>

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
