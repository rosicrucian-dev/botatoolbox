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
  /** word → flat pairs [trackIdx, count, trackIdx, count, …] */
  words: Record<string, number[]>
}

export interface CollectionSearchResult {
  track: SearchTrack
  /** Total occurrences of all matched words in this item. */
  count: number
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

/**
 * Query the index: every query word must appear in an item for it to match
 * (AND across words); the final word also matches by prefix so results appear
 * while the user is still typing. Ranked by total occurrences — the item that
 * says the word most rises to the top.
 */
export function searchIndex(
  index: CollectionSearchIndex,
  query: string,
  limit = 12,
): CollectionSearchResult[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const perToken = tokens.map((token, i) => {
    const hits = new Map<number, number>()
    const addWord = (word: string) => {
      const pairs = index.words[word]
      if (!pairs) return
      for (let p = 0; p < pairs.length; p += 2) {
        hits.set(pairs[p], (hits.get(pairs[p]) ?? 0) + pairs[p + 1])
      }
    }
    addWord(token)
    // Prefix-expand the last (still being typed) token.
    if (i === tokens.length - 1 && token.length >= 3) {
      for (const word of Object.keys(index.words)) {
        if (word.length > token.length && word.startsWith(token)) addWord(word)
      }
    }
    return hits
  })

  const [first, ...rest] = perToken
  const results: CollectionSearchResult[] = []
  for (const [trackIdx, count] of first) {
    let total = count
    let inAll = true
    for (const hits of rest) {
      const c = hits.get(trackIdx)
      if (!c) {
        inAll = false
        break
      }
      total += c
    }
    if (inAll) results.push({ track: index.tracks[trackIdx], count: total })
  }

  return results.sort((a, b) => b.count - a.count).slice(0, limit)
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
