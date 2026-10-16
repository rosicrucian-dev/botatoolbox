// Time the recordings search against the built index.
//
//   npm run bench:search
//
// Runs the golden queries plus their letter-by-letter prefixes — what the
// dialog actually does while someone types — and reports total and per-query
// time. A number to write in the PR description before and after an engine
// change (see docs/search-engine-redesign.md); not a test, nothing asserts.
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { loadIndex, search } from '../src/lib/search-engine/index.ts'

const ROOT = resolve(import.meta.dirname, '..')
const INDEX = join(ROOT, 'public/data/recordings-search.json')

const QUERIES = [
  'tarot',
  'tree of life',
  '"tree of life"',
  'key 21',
  'cube of space',
  'first matte',
  'color',
  'colors',
  'qabalah',
  'meditation on the',
  'ann davies',
  '"pattern on the trestleboard"',
  'hod',
  'א',
  'the',
]

// Every prefix of every query, as typed: "t", "ta", "tar", … Dedupe keeps the
// count honest.
const typed = [
  ...new Set(
    QUERIES.flatMap((q) =>
      Array.from({ length: q.length }, (_, i) => q.slice(0, i + 1)),
    ),
  ),
]

const index = loadIndex(JSON.parse(readFileSync(INDEX, 'utf8')))

// Warm up once so JIT and first-touch allocation don't land in the number.
for (const q of typed) search(index, q)

const ROUNDS = 5
const start = performance.now()
let results = 0
for (let r = 0; r < ROUNDS; r++) {
  for (const q of typed) results += search(index, q).length
}
const ms = performance.now() - start
const queries = typed.length * ROUNDS

console.log(
  `bench:search — ${index.docs.length} docs, ${index.terms.length} words\n` +
    `  ${queries} queries (${typed.length} typed prefixes × ${ROUNDS} rounds) ` +
    `in ${ms.toFixed(0)} ms — ${(ms / queries).toFixed(2)} ms/query, ` +
    `${(results / queries).toFixed(0)} results/query avg`,
)
