import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

// The private-pages route is mounted for `npm run dev` and must be gone
// before Next scans the route tree, which is what `check` asserts and
// what every build runs. It tested the legacy meditation courses' own
// dispatcher until 10 November 2026, when those courses were deleted.
const route = 'src/app/[locale]/(docs)/private'
const source = 'src/private-dev/app'

test('the private-pages route mounts for dev and is gone for a build', () => {
  const root = mkdtempSync(join(tmpdir(), 'bota-private-mount-'))
  try {
    mkdirSync(join(root, 'scripts'))
    cpSync(
      join(process.cwd(), 'scripts/private-mount.mjs'),
      join(root, 'scripts/private-mount.mjs'),
    )
    mkdirSync(join(root, source, '[group]', '[slug]'), { recursive: true })
    writeFileSync(
      join(root, source, '[group]/[slug]/page.tsx'),
      'export default function Page() {}',
    )

    const script = join(root, 'scripts/private-mount.mjs')
    const run = (action: string) =>
      spawnSync(process.execPath, [script, action], { cwd: root, encoding: 'utf8' })

    assert.equal(run('mount').status, 0)
    assert.equal(existsSync(join(root, route, '[group]/[slug]/page.tsx')), true)
    // A mounted route fails the assertion a direct production build makes.
    assert.equal(run('check').status, 1)

    assert.equal(run('unmount').status, 0)
    assert.equal(existsSync(join(root, route)), false)
    assert.equal(run('check').status, 0)
    // The source it was copied from is untouched.
    assert.equal(existsSync(join(root, source, '[group]/[slug]/page.tsx')), true)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
