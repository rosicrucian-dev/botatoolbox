// Gematria dictionary — a value-indexed map of every source's take on each
// number, listed BY SOURCE (nothing merged). GENERATED: the JSON is built by
// `scripts/build-gematria-words.ts` from the vendored sources under
// `scripts/vendor/` — edit those, not the JSON. The source registry (order,
// labels, kinds) lives in `./gematria-sources`.
//
// It is NOT bundled. The file is large (every value carries Crowley's curated
// words plus every Strong's word at that value plus the Paul Case notes), so it
// ships as a static file in /public and is FETCHED ON DEMAND, then cached for
// the page session. Validated once at build time (inside the generator); cast —
// not re-parsed — here.

import { z } from 'zod'

import { skeleton } from '@/lib/hebrew-letters'
import { type GematriaSourceId } from './gematria-sources'
import {
  GematriaWordSchema,
  GematriaNumberEntrySchema,
} from './schemas'

export type GematriaWord = z.infer<typeof GematriaWordSchema>
export type GematriaNumberEntry = z.infer<typeof GematriaNumberEntrySchema>
export type GematriaDict = Record<string, GematriaNumberEntry>

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

// The entry (all sources' content) for `n`, or undefined.
export function wordsForNumber(
  dict: GematriaDict,
  n: number,
): GematriaNumberEntry | undefined {
  if (!Number.isInteger(n) || n <= 0) return undefined
  return dict[String(n)]
}

// For a specific spelling built on the calculator: the matching word rows from
// each word-keyed source that shares that consonantal spelling, keyed by source
// id. One spelling can match several Strong's homographs, so each source maps
// to a LIST. Lets the calculator reuse the dictionary's per-source rendering.
export function wordMatchesForSpelling(
  dict: GematriaDict,
  value: number,
  hebrew: string,
): Partial<Record<GematriaSourceId, Array<GematriaWord>>> {
  const entry = wordsForNumber(dict, value)
  const target = skeleton(hebrew)
  if (!entry?.words || !target) return {}
  const out: Partial<Record<GematriaSourceId, Array<GematriaWord>>> = {}
  for (const [id, words] of Object.entries(entry.words)) {
    const matches = words.filter((w) => skeleton(w.hebrew) === target)
    if (matches.length) out[id as GematriaSourceId] = matches
  }
  return out
}
