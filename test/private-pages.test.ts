import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  privateModeEnabled,
  scanPrivatePages,
} from '../src/lib/privatePages.ts'

function withPages(run: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), 'bota-private-pages-'))
  try {
    run(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('private mode requires the explicit local-only switch', () => {
  const env = process.env as Record<string, string | undefined>
  const previousNodeEnv = env.NODE_ENV
  const previousPrivateMode = env.BOTA_PRIVATE_MODE
  try {
    env.NODE_ENV = 'development'
    env.BOTA_PRIVATE_MODE = '0'
    assert.equal(privateModeEnabled(), false)
    env.BOTA_PRIVATE_MODE = '1'
    assert.equal(privateModeEnabled(), true)
    env.NODE_ENV = 'production'
    assert.equal(privateModeEnabled(), false)
  } finally {
    if (previousNodeEnv === undefined) delete env.NODE_ENV
    else env.NODE_ENV = previousNodeEnv
    if (previousPrivateMode === undefined) delete env.BOTA_PRIVATE_MODE
    else env.BOTA_PRIVATE_MODE = previousPrivateMode
  }
})

test('private Markdown metadata, grouping, locale, and order share one index', () =>
  withPages((root) => {
    mkdirSync(join(root, 'reference'))
    writeFileSync(
      join(root, 'reference', 'notes.md'),
      '# My Notes\n\nReference text.\n',
    )
    writeFileSync(
      join(root, 'meditation.md'),
      [
        '---',
        'title: Morning Practice',
        'group: meditations',
        'slug: morning',
        'locale: en',
        'order: 2',
        '---',
        '# Body heading',
        '',
        'Practice text.',
      ].join('\n'),
    )
    const index = scanPrivatePages(root)
    assert.deepEqual(
      index.pages.map(({ group, slug, title, href, locale, order }) => ({
        group,
        slug,
        title,
        href,
        locale,
        order,
      })),
      [
        {
          group: 'meditations',
          slug: 'morning',
          title: 'Morning Practice',
          href: '/private/meditations/morning',
          locale: 'en',
          order: 2,
        },
        {
          group: 'reference',
          slug: 'notes',
          title: 'My Notes',
          href: '/private/reference/notes',
          locale: 'all',
          order: Number.MAX_SAFE_INTEGER,
        },
      ],
    )
    assert.equal(index.pages[0].body, '# Body heading\n\nPractice text.')
  }))

test('adding, editing, and removing a file changes the index immediately', () =>
  withPages((root) => {
    const file = join(root, 'entry.md')
    const first = scanPrivatePages(root)
    writeFileSync(
      file,
      '---\ngroup: utilities\n---\n# Entry\n\nFirst version.\n',
    )
    const added = scanPrivatePages(root)
    assert.equal(added.pages.length, 1)
    assert.notEqual(added.revision, first.revision)
    writeFileSync(
      file,
      '---\ngroup: utilities\n---\n# Entry\n\nSecond version.\n',
    )
    const edited = scanPrivatePages(root)
    assert.match(edited.pages[0].body, /Second version/)
    assert.notEqual(edited.revision, added.revision)
    rmSync(file)
    assert.deepEqual(scanPrivatePages(root).pages, [])
  }))

test('invalid metadata and duplicate routes fail with an actionable error', () =>
  withPages((root) => {
    writeFileSync(join(root, 'note.md'), '---\ngroup: unknown\n---\n# Note\n')
    assert.throws(
      () => scanPrivatePages(root),
      /group must name its existing navigation group/,
    )
    writeFileSync(
      join(root, 'note.md'),
      '---\ngroup: reference\nslug: shared\n---\n# Note\n',
    )
    mkdirSync(join(root, 'reference'))
    writeFileSync(
      join(root, 'shared.md'),
      '---\ngroup: reference\n---\n# Shared\n',
    )
    assert.throws(
      () => scanPrivatePages(root),
      /duplicate route \/private\/reference\/shared/,
    )
  }))
