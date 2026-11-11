// Mounts the development-only private pages route.
//
// `private/` is ignored, and nothing in it may reach a build: `npm run
// dev` mounts `src/private-dev/app` at /private/<group>/<slug>, which
// reads Markdown from `private/pages/`, and every build unmounts it
// before Next scans the route tree. `check` is the assertion a direct
// production build makes.
//
// IT USED TO CARRY THE LEGACY MEDITATION COURSES as well -- ten React
// courses in `private/legacy/`, generated into a catch-all dispatcher
// with an `@private/` import alias and a stylesheet of their own. They
// were temporary, standing in until the Hermetic Order of Aquarius
// could carry them, and they were deleted on 10 November 2026 once it
// could; all ten are courses there now, with `concentration` under
// Section C and `daily-meditation` under the Schedule. What is left is
// this one route.
import { cpSync, existsSync, lstatSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const marker = '.private-mount'
// Mounted path -> what it is copied from. Add a pair to mount another.
const mounts = [
  ['src/app/[locale]/(docs)/private', 'src/private-dev/app'],
]

const action = process.argv[2]
if (!['mount', 'unmount', 'check', 'test'].includes(action)) {
  throw new Error('Usage: node scripts/private-mount.mjs mount|unmount|check|test')
}

const isLink = (path) => {
  try { return lstatSync(path).isSymbolicLink() } catch { return false }
}
const isMounted = (path) => existsSync(join(path, marker))

for (const [path, from] of mounts) {
  const dest = join(root, path)
  if (action === 'test') continue
  if (action === 'check') {
    if (isLink(dest) || isMounted(dest)) {
      throw new Error(`Private development mount present: ${path}. Run npm run private:unmount before a production build.`)
    }
    continue
  }
  if (isLink(dest)) rmSync(dest)
  else if (isMounted(dest)) rmSync(dest, { recursive: true })
  else if (action === 'mount' && existsSync(dest)) {
    throw new Error(`Refusing to replace unexpected route: ${dest}`)
  }
  if (action === 'unmount') continue
  const source = join(root, from)
  if (!existsSync(source)) continue
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(source, dest, { recursive: true })
  writeFileSync(join(dest, marker), 'Generated from private source.\n')
}
