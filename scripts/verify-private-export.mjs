// Build with a harmless ignored page present, then prove that neither its
// marker nor a private route reached the static export.
import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const out = join(root, 'out')
const id = randomUUID().replaceAll('-', '')
const slug = `export-sentinel-${id}`
const marker = `BOTA_PRIVATE_EXPORT_SENTINEL_${id}`
const fixture = join(root, 'private', 'pages', 'reference', `${slug}.md`)
const cssMarker = `--bota-private-export-sentinel-${id}`
const cssFixture = join(root, 'private', 'legacy', 'src', `${slug}.tsx`)
const textExtensions = new Set([
  '.html',
  '.js',
  '.css',
  '.json',
  '.txt',
  '.xml',
  '.svg',
  '.webmanifest',
])
const publicMeditationRoutes = new Set(['pattern-trestleboard'])

function checkExport(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) checkExport(path)
    else if (entry.isFile() && textExtensions.has(extname(entry.name))) {
      const output = readFileSync(path)
      if (
        output.includes(Buffer.from(marker)) ||
        output.includes(Buffer.from(cssMarker))
      ) {
        throw new Error(`Private content reached the public export: ${path}`)
      }
    }
  }
}

mkdirSync(dirname(fixture), { recursive: true })
mkdirSync(dirname(cssFixture), { recursive: true })
writeFileSync(fixture, `---\ntitle: ${marker}\n---\n# ${marker}\n`)
writeFileSync(
  cssFixture,
  `export const sentinel = 'bg-[color:var(${cssMarker})]'\n`,
)
try {
  const tracked = spawnSync('git', ['ls-files', '--', 'private/'], {
    cwd: root,
    encoding: 'utf8',
  })
  if (tracked.error) throw tracked.error
  if (tracked.status !== 0)
    throw new Error('Could not inspect tracked private files')
  if (tracked.stdout.trim()) throw new Error('Private files are tracked by Git')
  const build = spawnSync('npm', ['run', 'verify:build'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, BOTA_PRIVATE_MODE: '0' },
  })
  if (build.error) throw build.error
  if (build.status !== 0)
    throw new Error(`Public build failed with status ${build.status}`)
  if (!existsSync(out)) throw new Error('Public export is missing')
  for (const localeRoot of [out, join(out, 'en'), join(out, 'de')]) {
    if (existsSync(join(localeRoot, 'private')))
      throw new Error('Private route reached the public export')
    const meditations = join(localeRoot, 'meditations')
    if (!existsSync(meditations)) continue
    for (const route of readdirSync(meditations, { withFileTypes: true })) {
      if (route.isDirectory() && !publicMeditationRoutes.has(route.name)) {
        throw new Error(
          `Private meditation route reached the public export: ${route.name}`,
        )
      }
    }
  }
  checkExport(out)
  process.stdout.write('Private export check passed.\n')
} finally {
  rmSync(fixture, { force: true })
  rmSync(cssFixture, { force: true })
}
