// Generic full-text search over a prebuilt inverted index — the shared
// engine behind every section-scoped search (recordings transcripts, the
// Book of Tokens meditations, …).
//
// A generator (scripts/gen-*-search.ts, via scripts/lib/build-search-index.ts)
// tokenizes each item's body with the SAME tokenize() below and writes a
// static /public JSON ({ tracks, words }); a search dialog fetches it on
// first open and queries it here. Keeping tokenizer + query logic in this one
// module is what guarantees the index and the queries can never disagree.
//
// Dependency-free on purpose: imported both by the client dialog (@/lib/…) and
// by the Node generators (relative path). Nothing browser- or Node-specific
// runs at import time. English-only tokenizer (one stopword set) — adequate
// while the only translated locale (de) ships English placeholder text.

export interface SearchTrack {
  /** Stable identity, used as the React key. */
  id: string
  title: string
  /** Optional secondary line under the title (e.g. a grouping). */
  subtitle?: string
  /** Route href to the result page. */
  href: string
}

export interface CollectionSearchIndex {
  tracks: SearchTrack[]
  /** word → flat runs of [trackIdx, count, ...positions] (see build-search-index) */
  words: Record<string, number[]>
}

export interface CollectionSearchResult {
  track: SearchTrack
  /** Total occurrences of all matched words in this item. */
  count: number
  /** Occurrences of the full query as a contiguous phrase (0 = scattered match,
   *  = count for a single-word query). Results are ranked by this first. */
  phrase: number
}

// High-frequency words that would match nearly every item. Doctrinal
// vocabulary (life, power, light, love…) stays searchable on purpose.
const STOPWORDS = new Set(
  (
    'the of is a and to in it that this as by which for with are be not was ' +
    'or its from an but have has we you your they their them he his him she ' +
    'her on at when what who whom whose there these those than then so if ' +
    'into upon our us out all will shall may can do does did been being were ' +
    'would should could also more most other some such no nor only very am ' +
    'i me my mine had how because while where after before between during'
  ).split(' '),
)

/**
 * Lowercase word tokens, apostrophe-trimmed, possessives folded onto their
 * noun, stopwords and single letters dropped. Used verbatim by both the index
 * generator and the query side.
 */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}][\p{L}']*/gu) ?? [])
    .map((w) => w.replace(/^'+|'+$/g, '').replace(/'s$/, ''))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
}

// Parse a word's flat [trackIdx, count, ...positions] runs into
// trackIdx → its positions in that track's token stream.
function positionsByTrack(runs: number[] | undefined): Map<number, number[]> {
  const out = new Map<number, number[]>()
  if (!runs) return out
  for (let i = 0; i < runs.length; ) {
    const track = runs[i]
    const count = runs[i + 1]
    out.set(track, runs.slice(i + 2, i + 2 + count))
    i += 2 + count
  }
  return out
}

// How many times the tokens occur at consecutive positions — token[0] at p,
// token[1] at p+1, … (a contiguous phrase). A single token counts every hit.
function countPhrases(perToken: Array<number[]>): number {
  if (perToken.length === 1) return perToken[0].length
  if (perToken.some((p) => p.length === 0)) return 0
  const later = perToken.slice(1).map((p) => new Set(p))
  let n = 0
  for (const p of perToken[0]) {
    if (later.every((set, k) => set.has(p + k + 1))) n++
  }
  return n
}

/**
 * Query the index: every query word must appear in an item (AND across words),
 * and the final word also matches by prefix so results stay live while typing.
 * Ranked by exact-PHRASE occurrences first (the words appearing consecutively),
 * then by total occurrences — so "Builders of the Adytum" surfaces items where
 * that phrase actually appears, above items that merely mention the words.
 */
export function searchIndex(
  index: CollectionSearchIndex,
  query: string,
  limit = 12,
): CollectionSearchResult[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const perToken = tokens.map((token, i) => {
    const exact = positionsByTrack(index.words[token])
    const count = new Map<number, number>()
    for (const [t, pos] of exact) count.set(t, pos.length)
    // Prefix-expand the last (still being typed) token for the loose count.
    if (i === tokens.length - 1 && token.length >= 3) {
      for (const word of Object.keys(index.words)) {
        if (word.length > token.length && word.startsWith(token)) {
          for (const [t, pos] of positionsByTrack(index.words[word])) {
            count.set(t, (count.get(t) ?? 0) + pos.length)
          }
        }
      }
    }
    return { exact, count }
  })

  const [first, ...rest] = perToken
  const results: CollectionSearchResult[] = []
  for (const [trackIdx, firstCount] of first.count) {
    let total = firstCount
    let inAll = true
    for (const pt of rest) {
      const c = pt.count.get(trackIdx)
      if (!c) {
        inAll = false
        break
      }
      total += c
    }
    if (!inAll) continue
    const phrase = countPhrases(perToken.map((pt) => pt.exact.get(trackIdx) ?? []))
    results.push({ track: index.tracks[trackIdx], count: total, phrase })
  }

  return results
    .sort((a, b) => b.phrase - a.phrase || b.count - a.count)
    .slice(0, limit)
}

// Fetch a (non-bundled) index once and cache the promise per URL for the
// session, so distinct collections don't clobber each other's cache.
const cache = new Map<string, Promise<CollectionSearchIndex>>()
export function fetchIndex(url: string): Promise<CollectionSearchIndex> {
  let promise = cache.get(url)
  if (!promise) {
    promise = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`search index ${url}: HTTP ${r.status}`)
        return r.json() as Promise<CollectionSearchIndex>
      })
      .catch((err) => {
        cache.delete(url) // don't cache a failure — allow retry
        throw err
      })
    cache.set(url, promise)
  }
  return promise
}
