// The cross-file integrity checks, run under `npm test` so a dangling
// reference in content/ fails here — fast, without a Next build — as well
// as at build time.
//
//   npm test
//
// Loads the real data layer through test/hooks.ts (path aliases + JSON).

import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { runIntegrityChecks } from '../src/content/integrity.ts'

test('the committed content passes every cross-file integrity check', () => {
  assert.doesNotThrow(() => runIntegrityChecks())
})

test('a manifest entry without its markdown file fails with the file path', () => {
  // A root whose content/texts/en/ exists but is empty: the texts manifest
  // (loaded from the real data layer) lists slugs that have no file here.
  const root = mkdtempSync(join(tmpdir(), 'integrity-'))
  try {
    mkdirSync(join(root, 'content', 'texts', 'en'), { recursive: true })
    assert.throws(
      () => runIntegrityChecks(root),
      (err: unknown) =>
        err instanceof Error &&
        err.message.startsWith('Data integrity error:') &&
        /texts\.json lists ".+" but content\/texts\/en\/.+\.md is missing/.test(
          err.message,
        ),
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
