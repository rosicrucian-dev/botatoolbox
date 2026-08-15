// Tests for botatoolbox's search adapter — the project-local half.
//
//   npm test
//
// The engine itself is covered by search-engine.test.ts, which is shared with
// agelesswisdom. This file covers what is NOT shared: this project's document
// type and the sidecar URL its dialog builds.

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildInvertedIndex } from '../src/lib/search-engine.ts'
import {
  searchIndex,
  snippetUrl,
  type CollectionSearchIndex,
  type SearchTrack,
} from '../src/lib/collection-search.ts'

const TRACK: SearchTrack = {
  id: 'the-life-power',
  title: 'The Life Power',
  subtitle: 'Interpretation',
  href: '/recordings/interpretation/the-life-power',
}

test('snippetUrl carries the index version so a deploy invalidates the cache', () => {
  assert.equal(
    snippetUrl(TRACK, 'abc123'),
    '/data/recordings-snippets/the-life-power.json?v=abc123',
  )
  // Without a stamp the URL still resolves — the sidecar is just cacheable.
  assert.equal(
    snippetUrl(TRACK),
    '/data/recordings-snippets/the-life-power.json',
  )
})

test('searchIndex queries with English, whatever the page locale', () => {
  // The `de` copy is an English placeholder, so both sides use the English
  // stopword list; revisit when real German transcripts land.
  const index: CollectionSearchIndex = buildInvertedIndex(
    [
      { doc: TRACK, text: 'the tree of life is a symbol of the life power' },
      { doc: { ...TRACK, id: 'other' }, text: 'a recording about the tarot' },
    ],
    'en',
  )
  const results = searchIndex(index, 'life power')
  assert.deepEqual(
    results.map((r) => r.doc.id),
    ['the-life-power'],
  )
  assert.equal(results[0].phrase, 1)
})

test('searchIndex honours its limit', () => {
  const index: CollectionSearchIndex = buildInvertedIndex(
    [
      { doc: TRACK, text: 'tarot tarot tarot' },
      { doc: { ...TRACK, id: 'b' }, text: 'tarot tarot' },
      { doc: { ...TRACK, id: 'c' }, text: 'tarot' },
    ],
    'en',
  )
  assert.equal(searchIndex(index, 'tarot', 2).length, 2)
})
