// Gematria dictionary — a value-indexed map of Hebrew words/phrases
// (Sepher Sephiroth + the full Hebrew Bible via Strong's). GENERATED: the JSON
// is built by `scripts/build-gematria-words.ts` from the sources under
// `scripts/vendor/` — edit those, not the JSON.
//
// It is NOT bundled. The file is large (every value carries Crowley's curated
// words plus every other Strong's word at that value), so it ships as a static
// file in /public and is FETCHED ON DEMAND, then cached for the page session.
// This keeps the gematria pages' initial JS small. Validated once at build time
// (inside the generator); cast — not re-parsed — here.

import { z } from 'zod'

import { skeleton } from '@/lib/hebrew-letters'
import {
  GematriaStrongsSchema,
  GematriaWordSchema,
  GematriaOtherSchema,
  GematriaNumberEntrySchema,
} from './schemas'

export type GematriaStrongs = z.infer<typeof GematriaStrongsSchema>
export type GematriaWord = z.infer<typeof GematriaWordSchema>
export type GematriaOther = z.infer<typeof GematriaOtherSchema>
export type GematriaNumberEntry = z.infer<typeof GematriaNumberEntrySchema>
export type GematriaDict = Record<string, GematriaNumberEntry>

// A meaning-bearing row, whether it's a curated Crowley word (has a gloss) or a
// Strong's-only "other" word (no gloss). Shared with <GematriaMeaning>.
export type GematriaMeaningLike = {
  crowley?: string
  strongs?: Array<GematriaStrongs>
}

// Fetch the dictionary once and cache the promise for the page session.
const DICT_URL = '/data/gematria-words.json'
let cache: Promise<GematriaDict> | null = null
export function fetchGematriaDict(): Promise<GematriaDict> {
  if (!cache) {
    cache = fetch(DICT_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`gematria dictionary: HTTP ${r.status}`)
        return r.json() as Promise<GematriaDict>
      })
      .catch((err) => {
        // Don't cache a failure — clear it so a later call (e.g. a remount)
        // retries instead of being stuck on the rejected promise forever.
        cache = null
        throw err
      })
  }
  return cache
}

// The entry (Crowley words + other words) summing to `n`, or undefined.
export function wordsForNumber(
  dict: GematriaDict,
  n: number,
): GematriaNumberEntry | undefined {
  if (!Number.isInteger(n) || n <= 0) return undefined
  return dict[String(n)]
}

// The meaning for a specific spelling at a known value, if the dictionary
// contains that exact word — checking Crowley's words first, then the other
// (Strong's-only) words. Used by the calculator to gloss the built word.
export function wordForSpelling(
  dict: GematriaDict,
  value: number,
  hebrew: string,
): GematriaMeaningLike | undefined {
  const entry = wordsForNumber(dict, value)
  if (!entry) return undefined
  const target = skeleton(hebrew)
  if (!target) return undefined
  return (
    entry.words.find((w) => skeleton(w.hebrew) === target) ??
    entry.other?.find((o) => skeleton(o.hebrew) === target)
  )
}
