// The locale merge (src/content/data/overlay.ts). This is the mechanism
// that lets a translator edit a full copy of any data file without being
// able to break structure: English is the authority for shape and keys,
// and only whitelisted display fields come from the translation. These
// tests pin that contract with synthetic targets, independent of the real
// data files.
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { type OverlayTarget } from '../src/content/data/overlay-config.ts'
import { mergeOverlay } from '../src/content/data/overlay.ts'

/** Run `fn` with console.warn captured; returns the warnings it emitted. */
function withWarnings<T>(fn: () => T): { result: T; warnings: string[] } {
  const warnings: string[] = []
  const original = console.warn
  console.warn = (msg: unknown) => {
    warnings.push(String(msg))
  }
  try {
    return { result: fn(), warnings }
  } finally {
    console.warn = original
  }
}

const BY_SLUG: OverlayTarget = {
  file: 'things',
  keying: { kind: 'field', field: 'slug' },
  fields: ['name', 'tags', 'meaning'],
}

const EN = [
  {
    slug: 'a',
    num: 1,
    name: 'Alpha',
    tags: ['x'],
    meaning: { up: 'U', down: 'D' },
  },
  {
    slug: 'b',
    num: 2,
    name: 'Beta',
    tags: ['y'],
    meaning: { up: 'U2', down: 'D2' },
  },
]

test('whitelisted display fields are taken from the translation, by key', () => {
  const de = [
    {
      slug: 'b',
      num: 2,
      name: 'Beta (de)',
      tags: ['y'],
      meaning: { up: 'U2', down: 'D2' },
    },
    {
      slug: 'a',
      num: 1,
      name: 'Alpha (de)',
      tags: ['x'],
      meaning: { up: 'U', down: 'D' },
    },
  ]
  const { result, warnings } = withWarnings(() => mergeOverlay(EN, de, BY_SLUG))
  assert.deepEqual(warnings, [])
  // English order wins even though the translation is reordered.
  assert.deepEqual(
    result.map((r) => r.name),
    ['Alpha (de)', 'Beta (de)'],
  )
  // The English rows are not mutated.
  assert.equal(EN[0].name, 'Alpha')
})

test('a structural field edited in the translation is ignored with a warning', () => {
  const de = [{ slug: 'a', num: 99, name: 'Alpha (de)' }]
  const { result, warnings } = withWarnings(() => mergeOverlay(EN, de, BY_SLUG))
  assert.equal(result[0].num, 1)
  assert.equal(result[0].name, 'Alpha (de)')
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /"num" is structural/)
})

test('a missing translated row falls back to English wholesale, silently', () => {
  const de = [{ slug: 'a', name: 'Alpha (de)' }]
  const { result, warnings } = withWarnings(() => mergeOverlay(EN, de, BY_SLUG))
  assert.deepEqual(warnings, [])
  assert.deepEqual(result[1], EN[1])
})

test('a translated row with no English counterpart is skipped with a warning', () => {
  const de = [{ slug: 'zzz', name: 'Ghost' }]
  const { result, warnings } = withWarnings(() => mergeOverlay(EN, de, BY_SLUG))
  assert.equal(result.length, 2)
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /"zzz" doesn't exist in English/)
})

test('a display field of the wrong type is skipped, not substituted', () => {
  const de = [{ slug: 'a', name: 42, tags: 'not-an-array' }]
  const { result, warnings } = withWarnings(() => mergeOverlay(EN, de, BY_SLUG))
  assert.equal(result[0].name, 'Alpha')
  assert.deepEqual(result[0].tags, ['x'])
  assert.equal(warnings.length, 2)
  assert.match(warnings[0], /"name" should be a string/)
  assert.match(warnings[1], /"tags" should be an array/)
})

test('an object field merges subkey by subkey and rejects unknown subkeys', () => {
  const de = [{ slug: 'a', meaning: { up: 'Oben', sideways: 'nope' } }]
  const { result, warnings } = withWarnings(() => mergeOverlay(EN, de, BY_SLUG))
  assert.deepEqual(result[0].meaning, { up: 'Oben', down: 'D' })
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /unknown subfield "meaning.sideways"/)
})

test('a translation that is not an array is ignored with a warning', () => {
  const { result, warnings } = withWarnings(() =>
    mergeOverlay(EN, { not: 'an array' }, BY_SLUG),
  )
  assert.deepEqual(result, EN)
  assert.notEqual(result, EN) // a copy, never the English array itself
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /should be an array/)
})

test('index keying merges by position and warns on a length mismatch', () => {
  const target: OverlayTarget = {
    file: 'rows',
    keying: { kind: 'index' },
    fields: ['label'],
  }
  const en = [
    { id: 1, label: 'One' },
    { id: 2, label: 'Two' },
  ]
  const de = [{ id: 1, label: 'Eins' }]
  const { result, warnings } = withWarnings(() => mergeOverlay(en, de, target))
  assert.deepEqual(
    result.map((r) => r.label),
    ['Eins', 'Two'],
  )
  // One warning for the length mismatch, one for the row that has no
  // translated counterpart (and therefore falls back to English).
  assert.equal(warnings.length, 2)
  assert.match(warnings[0], /translation has 1 rows but English has 2/)
  assert.match(warnings[1], /row 2: expected an object/)
})

test('index keying replaces tuple rows wholesale when the length matches', () => {
  const target: OverlayTarget = {
    file: 'pairs',
    keying: { kind: 'index' },
    fields: [],
  }
  const en = [['left', 'right']]
  const { result, warnings } = withWarnings(() =>
    mergeOverlay(en, [['links', 'rechts']], target),
  )
  assert.deepEqual(result, [['links', 'rechts']])
  assert.deepEqual(warnings, [])
  const short = withWarnings(() => mergeOverlay(en, [['only-one']], target))
  assert.deepEqual(short.result, en)
  assert.match(short.warnings[0], /expected an array of length 2/)
})

test('nested keying pairs groups and children by their keys', () => {
  const target: OverlayTarget = {
    file: 'suits',
    keying: {
      kind: 'nested',
      groupBy: 'suit',
      childList: 'cards',
      childKey: 'num',
    },
    fields: ['keyword'],
  }
  const en = [
    {
      suit: 'wands',
      cards: [
        { num: 1, keyword: 'Ace' },
        { num: 2, keyword: 'Two' },
      ],
    },
  ]
  const de = [
    {
      suit: 'wands',
      cards: [
        { num: 2, keyword: 'Zwei' },
        { num: 7, keyword: 'Sieben' },
      ],
    },
    { suit: 'cups', cards: [] },
  ]
  const { result, warnings } = withWarnings(() => mergeOverlay(en, de, target))
  assert.deepEqual(
    result[0].cards.map((c) => c.keyword),
    ['Ace', 'Zwei'],
  )
  assert.equal(warnings.length, 2)
  assert.match(warnings[0], /"wands" 7 doesn't exist in English/)
  assert.match(warnings[1], /group "cups" doesn't exist in English/)
})
