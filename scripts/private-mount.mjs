// Keeps the existing React meditation courses in the ignored private/
// directory. Dev generates one course dispatcher; the @private/ path alias
// resolves its imports without scattering symlinks through the public tree.
// Builds remove the dispatcher before Next scans routes.
import { cpSync, existsSync, lstatSync, mkdirSync, readlinkSync, readdirSync, renameSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const backup = join(root, 'private', 'legacy')
const meditationsRoot = 'src/app/[locale]/(docs)/meditations'
const courseRoute = `${meditationsRoot}/[...course]`
const courseSource = join(backup, meditationsRoot)
// Clean up route copies created by older versions of this script. Check these
// too so a direct production build cannot overlook a stale private route.
const oldCourseRoutes = [
  'daily-meditation', 'introduction-to-tarot', 'tarot-fundamentals',
  'supersensory-powers', 'tarot-interpretation', 'master-pattern',
  'tree-of-life', 'paths-of-wisdom', 'sound-and-colour', 'concentration',
].map((slug) => `${meditationsRoot}/${slug}`)
const paths = [
  courseRoute,
  'test/courses.test.ts',
  'test/rotation.test.ts',
  'test/fixtures/meditations-oracle.json',
]
// Remove aliases made by older versions when upgrading an existing checkout.
const oldImportMounts = [
  'src/private-courses',
  'src/components/meditations',
  'src/lib/courses',
  'src/lib/rotation.ts',
  'src/lib/meditationFacts.ts',
  'src/lib/stores/coursePositions.ts',
  'src/content/data/meditations.ts',
  ...['en', 'de'].flatMap((locale) => [
    'meditations-concentration.json', 'meditations-instructions.json',
    'meditations-supersensory-powers.json',
    'meditations-tarot-fundamentals.json',
    'meditations-tarot-interpretation.json',
    'meditations-tree-of-life.json', 'paths-of-wisdom.json',
    'tarot-interpretation-tableaux.json',
  ].map((name) => `content/data/${locale}/${name}`)),
]
const genericRoute = 'src/app/[locale]/(docs)/private'
const localMeditationsLayout = 'src/app/[locale]/(docs)/meditations/layout.tsx'
if (actionIsMount()) paths.push(genericRoute)
if (actionIsMount()) paths.push(localMeditationsLayout)

function actionIsMount() {
  return process.argv[2] === 'mount' || process.argv[2] === 'unmount' || process.argv[2] === 'check'
}

function isLink(path) {
  try { return lstatSync(path).isSymbolicLink() } catch { return false }
}
const marker = '.private-mount'
function isMountedDirectory(path) {
  return existsSync(join(path, marker))
}

const action = process.argv[2]
if (!['adopt', 'mount', 'unmount', 'check', 'test'].includes(action)) {
  throw new Error('Usage: node scripts/private-mount.mjs adopt|mount|unmount|check|test')
}

function discoverCourses() {
  if (!existsSync(courseSource)) return []
  const courses = []
  for (const entry of readdirSync(courseSource, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = join(courseSource, entry.name)
    if (!existsSync(join(dir, 'page.tsx'))) continue
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)) {
      throw new Error(`Invalid private course slug: ${entry.name}`)
    }
    const details = readdirSync(dir, { withFileTypes: true })
      .filter((child) => child.isDirectory() && existsSync(join(dir, child.name, 'page.tsx')))
    if (details.some((child) => !/^\[[a-z][a-zA-Z0-9]*\]$/.test(child.name))) {
      throw new Error(`Private course ${entry.name} has an unsupported detail route`)
    }
    if (details.length > 1) throw new Error(`Private course ${entry.name} has more than one detail route`)
    courses.push({ slug: entry.name, detail: details[0]?.name, detailParam: details[0]?.name.slice(1, -1) })
  }
  return courses.sort((a, b) => a.slug.localeCompare(b.slug))
}

function writeCourseDispatcher(dest) {
  const courses = discoverCourses()
  if (courses.length === 0) return false
  const entries = courses.map(({ slug, detail, detailParam }) => [
    `  ${JSON.stringify(slug)}: {`,
    `    index: () => import('@private/app/[locale]/(docs)/meditations/${slug}/page'),`,
    ...(detail ? [
      `    detail: () => import('@private/app/[locale]/(docs)/meditations/${slug}/${detail}/page'),`,
      `    detailParam: ${JSON.stringify(detailParam)},`,
    ] : []),
    '  },',
  ].join('\n'))
  const code = [
    '// Generated locally from ignored private course pages. Do not edit.',
    "import { createPrivateCourseDispatcher } from '@/private-dev/course-dispatcher'",
    '',
    'const dispatcher = createPrivateCourseDispatcher({',
    ...entries,
    '})',
    '',
    "export const dynamic = 'force-dynamic'",
    'export const generateMetadata = dispatcher.generateMetadata',
    'export default dispatcher.Page',
    '',
  ].join('\n')
  mkdirSync(dest, { recursive: true })
  writeFileSync(join(dest, 'page.tsx'), code)
  writeFileSync(join(dest, 'courses.json'), JSON.stringify(courses.map(({ slug }) => slug)))
  writeFileSync(join(dest, marker), 'Generated from private source.\n')
  return true
}

if (action === 'mount' || action === 'unmount' || action === 'check') {
  for (const path of [...oldCourseRoutes, ...oldImportMounts]) {
    const dest = join(root, path)
    if (action === 'check') {
      if (isLink(dest) || isMountedDirectory(dest)) {
        throw new Error(`Private development mount present: ${path}. Run npm run private:unmount before a production build.`)
      }
    } else if (isLink(dest)) unlinkSync(dest)
    else if (isMountedDirectory(dest)) rmSync(dest, { recursive: true })
    else if (action === 'mount' && existsSync(dest) && oldCourseRoutes.includes(path)) {
      throw new Error(`Unexpected route conflicts with private course dispatcher: ${dest}`)
    }
  }
}

for (const path of paths) {
  const dest = join(root, path)
  const source = path === genericRoute
    ? join(root, 'src/private-dev/app')
    : path === localMeditationsLayout
      ? join(root, 'src/private-dev/meditations-layout.tsx')
    : path === courseRoute
      ? courseSource
    : join(backup, path)
  const isRoute = path.startsWith('src/app/')
  const isRouteDirectory = isRoute && path !== localMeditationsLayout
  if (action === 'test' && isRoute) continue
  if (action === 'check') {
    if (isLink(dest) || isMountedDirectory(dest)) throw new Error(`Private development mount present: ${path}. Run npm run private:unmount before a production build.`)
    continue
  }
  if (action === 'unmount') {
    if (isLink(dest)) unlinkSync(dest)
    else if (isRouteDirectory && isMountedDirectory(dest)) rmSync(dest, { recursive: true })
    continue
  }
  if (action === 'adopt' && path === courseRoute) continue
  if (action === 'adopt' && existsSync(dest) && !isLink(dest)) {
    if (existsSync(source)) throw new Error(`Refusing to replace existing private copy: ${source}`)
    mkdirSync(dirname(source), { recursive: true })
    renameSync(dest, source)
  }
  if (!existsSync(source)) continue
  if (isRouteDirectory) {
    if (isLink(dest)) unlinkSync(dest)
    else if (isMountedDirectory(dest)) rmSync(dest, { recursive: true })
    else if (existsSync(dest)) throw new Error(`Refusing to replace unexpected route: ${dest}`)
    if (path === courseRoute) {
      writeCourseDispatcher(dest)
      continue
    }
    mkdirSync(dirname(dest), { recursive: true })
    cpSync(source, dest, { recursive: true })
    writeFileSync(join(dest, marker), 'Generated from private source.\n')
    continue
  }
  if (existsSync(dest)) {
    if (!isLink(dest) || resolve(dirname(dest), readlinkSync(dest)) !== source) {
      throw new Error(`Refusing to replace unexpected file: ${dest}`)
    }
    continue
  }
  mkdirSync(dirname(dest), { recursive: true })
  symlinkSync(relative(dirname(dest), source), dest)
}
