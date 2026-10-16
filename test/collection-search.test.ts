// Tests for botatoolbox's search adapter — the project-local half.
//
//   npm test
//
// The engine itself is covered by test/search-engine/, which is shared with
// agelesswisdom. This file covers what is NOT shared: what a recording carries
// as meta, the URL of its section texts, and that a result's best section is
// the paragraph number the transcript page answers to.

import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  RECORDINGS_TOKENIZER,
  snippetUrl,
  type SearchTrackMeta,
} from '../src/lib/collectionSearch.ts'
import {
  buildIndex,
  search,
  type SearchDocument,
} from '../src/lib/search-engine/index.ts'

const TRACK: SearchDocument<SearchTrackMeta> = {
  id: 'the-life-power',
  title: 'The Life Power',
  meta: {
    subtitle: 'Interpretation',
    href: '/recordings/interpretation/the-life-power',
  },
  sections: [
    { text: 'Good evening, everyone.' },
    { text: 'Tonight we speak of the cube of space.' },
    { text: 'The cube has six faces and twelve edges.' },
  ],
}

test('snippetUrl carries the index stamp so a deploy invalidates the cache', () => {
  assert.equal(
    snippetUrl(TRACK.id, 'abc123'),
    '/data/recordings-snippets/the-life-power.json?v=abc123',
  )
})

test('snippetUrl without a stamp still resolves', () => {
  assert.equal(
    snippetUrl(TRACK.id),
    '/data/recordings-snippets/the-life-power.json',
  )
})

test('a result carries the meta back and its best section is the paragraph number', () => {
  const { index, sections } = buildIndex([TRACK], {
    tokenizer: RECORDINGS_TOKENIZER,
  })
  const [result] = search(index, 'cube of space')
  assert.deepEqual(result.meta, TRACK.meta)
  // The phrase is in paragraph 1 — the `#p1` the transcript page scrolls to —
  // and the section texts the dialog shows are the same paragraphs.
  assert.equal(result.best.where, 'body')
  assert.equal(result.best.section, 1)
  assert.equal(sections[TRACK.id][1], 'Tonight we speak of the cube of space.')
})

test('a number in a transcript is searchable', () => {
  const { index } = buildIndex([TRACK], { tokenizer: RECORDINGS_TOKENIZER })
  assert.equal(search(index, 'twelve').length, 1)
  const numbered = buildIndex(
    [{ ...TRACK, sections: [{ text: 'Key 21, The World.' }] }],
    { tokenizer: RECORDINGS_TOKENIZER },
  ).index
  assert.equal(search(numbered, 'key 21').length, 1)
  assert.equal(search(numbered, '"key 21"').length, 1)
})
