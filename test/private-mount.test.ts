import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const appRoot = 'src/app/[locale]/(docs)/meditations'

test('local course routes and navigation come from the same private folders', () => {
  const root = mkdtempSync(join(tmpdir(), 'bota-private-mount-'))
  try {
    mkdirSync(join(root, 'scripts'))
    cpSync(
      join(process.cwd(), 'scripts/private-mount.mjs'),
      join(root, 'scripts/private-mount.mjs'),
    )
    const privateRoot = join(root, 'private/legacy', appRoot)
    mkdirSync(join(privateRoot, 'first-course', '[week]'), { recursive: true })
    writeFileSync(join(privateRoot, 'first-course/page.tsx'), 'export default function Page() {}')
    writeFileSync(join(privateRoot, 'first-course/[week]/page.tsx'), 'export default function Page() {}')
    mkdirSync(join(privateRoot, 'second-course'), { recursive: true })
    writeFileSync(join(privateRoot, 'second-course/page.tsx'), 'export default function Page() {}')

    const script = join(root, 'scripts/private-mount.mjs')
    const run = (action: string) =>
      spawnSync(process.execPath, [script, action], {
        cwd: root,
        encoding: 'utf8',
      })
    assert.equal(run('mount').status, 0)

    const route = join(root, appRoot, '[...course]')
    const code = readFileSync(join(route, 'page.tsx'), 'utf8')
    assert.match(code, /@private\/app\/\[locale\]\/\(docs\)\/meditations\/first-course\/page/)
    assert.match(code, /@private\/app\/\[locale\]\/\(docs\)\/meditations\/first-course\/\[week\]\/page/)
    assert.match(code, /detailParam: "week"/)
    assert.match(code, /@private\/app\/\[locale\]\/\(docs\)\/meditations\/second-course\/page/)
    assert.deepEqual(JSON.parse(readFileSync(join(route, 'courses.json'), 'utf8')), [
      'first-course',
      'second-course',
    ])
    assert.equal(run('check').status, 1)
    assert.equal(run('unmount').status, 0)
    assert.equal(run('check').status, 0)
    assert.equal(existsSync(route), false)
    assert.equal(existsSync(join(root, 'src/private-courses')), false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
