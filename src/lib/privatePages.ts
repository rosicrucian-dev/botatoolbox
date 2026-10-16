import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isLocale, type Locale } from '@/lib/locales'
import { navGroups } from '@/lib/navData'

const pagesRoot = join(process.cwd(), 'private', 'pages')
const courseManifest = join(
  process.cwd(),
  'src',
  'app',
  '[locale]',
  '(docs)',
  'meditations',
  '[...course]',
  'courses.json',
)
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const metadataKeys = new Set(['title', 'group', 'slug', 'locale', 'order'])

// `dev:public` also runs with NODE_ENV=development, but must never read
// private files: it listens on the LAN. Only `npm run dev` sets this flag.
export function privateModeEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.BOTA_PRIVATE_MODE === '1'
  )
}

export interface PrivatePage {
  group: string
  slug: string
  title: string
  href: string
  locale: Locale | 'all'
  order: number
}

interface PrivatePageEntry extends PrivatePage {
  body: string
}

export interface PrivatePageIndex {
  pages: PrivatePageEntry[]
  revision: string
}

function metadata(
  body: string,
  path: string,
): { values: Record<string, string>; content: string } {
  if (!body.startsWith('---\n') && !body.startsWith('---\r\n')) {
    return { values: {}, content: body }
  }
  const match = body.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match)
    throw new Error(`Private page ${path}: missing closing --- metadata line`)
  const values: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const pair = line.match(/^([a-z]+):\s*(.*)$/)
    if (!pair || !metadataKeys.has(pair[1]) || pair[1] in values) {
      throw new Error(`Private page ${path}: invalid metadata line "${line}"`)
    }
    let value = pair[2].trim()
    if (value.startsWith('"')) {
      try {
        const parsed: unknown = JSON.parse(value)
        if (typeof parsed !== 'string') throw new Error('Expected a string')
        value = parsed
      } catch {
        throw new Error(
          `Private page ${path}: invalid quoted value for ${pair[1]}`,
        )
      }
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1)
    }
    values[pair[1]] = value
  }
  return { values, content: body.slice(match[0].length) }
}

/** Read local Markdown anew on each call; no Next or module-level file cache. */
export function scanPrivatePages(root = pagesRoot): PrivatePageIndex {
  const pages: PrivatePageEntry[] = []
  const groups = new Set(navGroups.map((group) => group.slug))
  const hash = createHash('sha256')
  if (!existsSync(root)) return { pages, revision: hash.digest('hex') }

  function add(path: string, filename: string, directoryGroup?: string) {
    if (!filename.endsWith('.md')) return
    const fileSlug = filename.slice(0, -3)
    if (!slugPattern.test(fileSlug))
      throw new Error(`Private page ${path}: invalid filename`)
    const source = readFileSync(path, 'utf8')
    const { values, content } = metadata(source, path)
    const group = values.group ?? directoryGroup
    const slug = values.slug ?? fileSlug
    if (
      !group ||
      !groups.has(group) ||
      (directoryGroup && directoryGroup !== group)
    ) {
      throw new Error(
        `Private page ${path}: group must name its existing navigation group`,
      )
    }
    if (!slugPattern.test(slug))
      throw new Error(`Private page ${path}: invalid slug "${slug}"`)
    const locale = values.locale ?? 'all'
    if (locale !== 'all' && !isLocale(locale)) {
      throw new Error(`Private page ${path}: invalid locale "${locale}"`)
    }
    const order =
      values.order === undefined
        ? Number.MAX_SAFE_INTEGER
        : Number(values.order)
    if (!Number.isSafeInteger(order) || order < 0) {
      throw new Error(
        `Private page ${path}: order must be a nonnegative integer`,
      )
    }
    const title =
      values.title ||
      content.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
      slug.replaceAll('-', ' ')
    const href = `/private/${group}/${slug}`
    if (pages.some((page) => page.href === href)) {
      throw new Error(`Private page ${path}: duplicate route ${href}`)
    }
    pages.push({ group, slug, title, href, locale, order, body: content })
    hash.update(path).update('\0').update(source).update('\0')
  }

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile()) add(join(root, entry.name), entry.name)
    if (!entry.isDirectory()) continue
    if (!groups.has(entry.name)) {
      if (
        readdirSync(join(root, entry.name)).some((name) => name.endsWith('.md'))
      ) {
        throw new Error(
          `Private pages: unknown navigation group "${entry.name}"`,
        )
      }
      continue
    }
    for (const file of readdirSync(join(root, entry.name), {
      withFileTypes: true,
    })) {
      if (file.isFile())
        add(join(root, entry.name, file.name), file.name, entry.name)
    }
  }
  pages.sort(
    (a, b) =>
      a.group.localeCompare(b.group) ||
      a.order - b.order ||
      a.title.localeCompare(b.title),
  )
  return { pages, revision: hash.digest('hex') }
}

export function privatePageIndex(): PrivatePageIndex {
  if (!privateModeEnabled()) return { pages: [], revision: '' }
  const index = scanPrivatePages()
  const { raw } = mountedCourses()
  return {
    ...index,
    revision: createHash('sha256').update(index.revision).update(raw).digest('hex'),
  }
}

export function privatePage(
  group: string,
  slug: string,
  locale: Locale,
): { title: string; body: string } | null {
  if (
    !privateModeEnabled() ||
    !slugPattern.test(group) ||
    !slugPattern.test(slug)
  )
    return null
  const page = privatePageIndex().pages.find(
    (entry) =>
      entry.group === group &&
      entry.slug === slug &&
      (entry.locale === 'all' || entry.locale === locale),
  )
  return page ? { title: page.title, body: page.body } : null
}

function mountedCourses(): { slugs: string[]; raw: string } {
  try {
    const raw = readFileSync(courseManifest, 'utf8')
    const parsed: unknown = JSON.parse(raw)
    if (
      !Array.isArray(parsed) ||
      !parsed.every((slug) => typeof slug === 'string' && slugPattern.test(slug))
    ) return { slugs: [], raw: '' }
    return { slugs: parsed, raw }
  } catch {
    // A mount can be regenerated while the local navigation is polling.
    return { slugs: [], raw: '' }
  }
}

export function privateLegacySlugs(): string[] {
  return privateModeEnabled() ? mountedCourses().slugs : []
}

export interface PrivateMinorMeaning {
  intro: string
  wellDignified: string
  illDignified: string
}

export function privateMinorMeaning(
  locale: Locale,
  slug: string,
): PrivateMinorMeaning | null {
  if (!privateModeEnabled() || !slugPattern.test(slug)) return null
  const path = join(
    process.cwd(),
    'private',
    'minor-meanings',
    `${locale}.json`,
  )
  if (!existsSync(path)) return null
  const meanings: Record<string, PrivateMinorMeaning> = JSON.parse(
    readFileSync(path, 'utf8'),
  )
  return meanings[slug] ?? null
}
