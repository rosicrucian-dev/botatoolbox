// Recordings-scoped full-text search over a prebuilt inverted index.
//
// scripts/gen-recordings-search.ts tokenizes every transcript with the SAME
// tokenize() below and writes public/data/recordings-search.json
// ({ tracks, words }); the recordings search dialog fetches it on first open
// and queries it here. Keeping tokenizer + query logic in this one module is
// what guarantees the index and the queries can never disagree. Ported from
// the agelesswisdom lesson search — English-only (one stopword set), and
// results resolve to a recording rather than a lesson.
//
// Dependency-free on purpose: imported both by the client dialog (@/lib/…)
// and by the Node generator (relative path). Nothing browser- or Node-
// specific runs at import time.

export interface SearchTrack {
  slug: string
  title: string
  grouping: string
  /** Route href to the transcript page. */
  href: string
}

export interface RecordingsSearchIndex {
  tracks: SearchTrack[]
  /** word → flat pairs [trackIdx, count, trackIdx, count, …] */
  words: Record<string, number[]>
}

export interface RecordingsSearchResult {
  track: SearchTrack
  /** Total occurrences of all matched words in this transcript. */
  count: number
}

// High-frequency words that would match nearly every transcript. Doctrinal
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
 * Query the index: every query word must appear in a transcript for it to
 * match (AND across words); the final word also matches by prefix so results
 * appear while the user is still typing. Ranked by total occurrences — the
 * transcript that says the word most rises to the top.
 */
export function searchIndex(
  index: RecordingsSearchIndex,
  query: string,
  limit = 12,
): RecordingsSearchResult[] {
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
  const results: RecordingsSearchResult[] = []
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

// Fetch the (non-bundled) index once and cache the promise for the session.
const INDEX_URL = '/data/recordings-search.json'
let cache: Promise<RecordingsSearchIndex> | null = null
export function fetchRecordingsIndex(): Promise<RecordingsSearchIndex> {
  if (!cache) {
    cache = fetch(INDEX_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`recordings search index: HTTP ${r.status}`)
        return r.json() as Promise<RecordingsSearchIndex>
      })
      .catch((err) => {
        cache = null // don't cache a failure — allow retry
        throw err
      })
  }
  return cache
}
