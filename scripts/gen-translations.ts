// Generates/refreshes the per-locale translation skeletons the
// translator edits:
//
//   content/data/<locale>/<file>.json   — one overlay per data file in
//     overlay-config.ts, holding ONLY the translatable fields, keyed by
//     each entry's stable key and pre-filled with the current English
//     text. Values already changed (i.e. translated) are NEVER
//     overwritten; new English entries/fields are added; keys that no
//     longer exist in English are kept (never destroy work) but warned
//     about.
//
//   content/texts/<locale>/<slug>.md, content/rituals/<locale>/<slug>.md
//     — full markdown copies of the English texts (translate prose IN
//     PLACE, keep the heading/step structure). Created only when
//     missing; existing files are never touched. content/changelog.md
//     stays English-only on purpose.
//
// Idempotent: running it twice produces no diff. Run it after adding
// English content to extend the skeletons. See content/TRANSLATING.md
// for the translator-facing guide.
//
// Run with: npm run gen:translations

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  overlayTargets,
  type OverlayTarget,
} from '../src/content/data/overlay-config.ts'
import { en as chromeEnglish } from '../src/content/messages/en/index.ts'
import { DEFAULT_LOCALE, LOCALES } from '../src/lib/locales.ts'
import { navMessageEntries } from '../src/lib/nav-data.ts'

const here = import.meta.dirname
const root = join(here, '..')
const dataDir = join(root, 'content', 'data')

const locales = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeIfChanged(path: string, content: string): boolean {
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return false
  writeFileSync(path, content)
  return true
}

// One entry's skeleton: whitelisted English fields, with any existing
// overlay values carried over verbatim (they may be translations).
// Object fields (minor-arcana `meaning`) merge subkey-wise so a new
// English subkey appears without clobbering translated siblings.
function entrySkeleton(
  en: Record<string, unknown>,
  existing: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  const prev = isRecord(existing) ? existing : {}
  const out: Record<string, unknown> = {}
  for (const field of fields) {
    const enValue = en[field]
    if (enValue === undefined) continue
    const prevValue = prev[field]
    if (prevValue === undefined) {
      out[field] = enValue
    } else if (isRecord(enValue) && isRecord(prevValue)) {
      const merged: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(enValue)) {
        merged[k] = prevValue[k] !== undefined ? prevValue[k] : v
      }
      out[field] = merged
    } else {
      out[field] = prevValue
    }
  }
  // Never destroy: carry over any unknown fields the file already had
  // (the runtime merge warns about them; a human resolves).
  for (const [k, v] of Object.entries(prev)) {
    if (!(k in out) && en[k] === undefined) out[k] = v
  }
  return out
}

// Rough translation progress: a leaf counts as translated when it
// differs from the current English value. (A translation that exactly
// matches English — or predates an English edit — counts as pending;
// see TRANSLATING.md.)
function countLeaves(
  skeleton: unknown,
  en: unknown,
): { total: number; translated: number } {
  if (typeof skeleton === 'string') {
    return { total: 1, translated: skeleton !== en ? 1 : 0 }
  }
  if (Array.isArray(skeleton)) {
    const enArr = Array.isArray(en) ? en : []
    let total = 0
    let translated = 0
    skeleton.forEach((v, i) => {
      const c = countLeaves(v, enArr[i])
      total += c.total
      translated += c.translated
    })
    return { total, translated }
  }
  if (isRecord(skeleton)) {
    const enRec = isRecord(en) ? en : {}
    let total = 0
    let translated = 0
    for (const [k, v] of Object.entries(skeleton)) {
      const c = countLeaves(v, enRec[k])
      total += c.total
      translated += c.translated
    }
    return { total, translated }
  }
  return { total: 0, translated: 0 }
}

function buildSkeleton(
  target: OverlayTarget,
  enData: unknown,
  existing: unknown,
): { skeleton: unknown; enShadow: unknown } {
  const { keying, fields } = target
  const enRows = Array.isArray(enData) ? enData : []

  if (keying.kind === 'index') {
    // Positional tables. Tuple rows (pillars) are copied wholesale;
    // object rows keep only the whitelisted fields.
    const prevRows = Array.isArray(existing) ? existing : []
    const skeleton = enRows.map((row, i) => {
      if (Array.isArray(row)) {
        const prev = prevRows[i]
        return Array.isArray(prev) && prev.length === row.length ? prev : row
      }
      return isRecord(row) ? entrySkeleton(row, prevRows[i], fields) : row
    })
    const enShadow = enRows.map((row) =>
      Array.isArray(row)
        ? row
        : isRecord(row)
          ? entrySkeleton(row, undefined, fields)
          : row,
    )
    return { skeleton, enShadow }
  }

  const prev = isRecord(existing) ? existing : {}
  const skeleton: Record<string, unknown> = {}
  const enShadow: Record<string, unknown> = {}

  if (keying.kind === 'field') {
    for (const row of enRows) {
      if (!isRecord(row)) continue
      const key = String(row[keying.field])
      skeleton[key] = entrySkeleton(row, prev[key], fields)
      enShadow[key] = entrySkeleton(row, undefined, fields)
    }
  } else {
    // nested (minor-arcana)
    for (const group of enRows) {
      if (!isRecord(group)) continue
      const groupKey = String(group[keying.groupBy])
      const prevGroup = isRecord(prev[groupKey])
        ? (prev[groupKey] as Record<string, unknown>)
        : {}
      const children = group[keying.childList]
      const groupSkeleton: Record<string, unknown> = {}
      const groupShadow: Record<string, unknown> = {}
      if (Array.isArray(children)) {
        for (const child of children) {
          if (!isRecord(child)) continue
          const childKey = String(child[keying.childKey])
          groupSkeleton[childKey] = entrySkeleton(
            child,
            prevGroup[childKey],
            fields,
          )
          groupShadow[childKey] = entrySkeleton(child, undefined, fields)
        }
      }
      skeleton[groupKey] = groupSkeleton
      enShadow[groupKey] = groupShadow
    }
  }

  // Orphaned keys: kept (never destroy possible translations), warned.
  for (const key of Object.keys(prev)) {
    if (!(key in skeleton)) {
      console.warn(
        `gen-translations: ${target.file}: key "${key}" no longer exists in English — kept, please review`,
      )
      skeleton[key] = prev[key]
    }
  }

  return { skeleton, enShadow }
}

// ---------- data overlays ----------

for (const locale of locales) {
  const localeDir = join(dataDir, locale)
  mkdirSync(localeDir, { recursive: true })

  for (const target of overlayTargets) {
    const enData = readJson(join(dataDir, `${target.file}.json`))
    const overlayPath = join(localeDir, `${target.file}.json`)
    const existing = existsSync(overlayPath) ? readJson(overlayPath) : undefined

    const { skeleton, enShadow } = buildSkeleton(target, enData, existing)
    const changed = writeIfChanged(
      overlayPath,
      JSON.stringify(skeleton, null, 2) + '\n',
    )

    const { total, translated } = countLeaves(skeleton, enShadow)
    console.log(
      `${changed ? 'wrote  ' : 'current'} ${join('content/data', locale, `${target.file}.json`)} — ${translated}/${total} translated`,
    )
  }
}

// ---------- chrome messages (content/messages/<locale>.json) ----------
//
// Flat key → string map for menus, buttons, page titles and other UI
// chrome. English source = the typed catalog (src/content/messages/en/)
// plus the nav strings derived from src/lib/nav-data.ts.

const fullEnglish: Record<string, string> = {
  ...chromeEnglish,
  ...navMessageEntries(),
}

for (const locale of locales) {
  const dir = join(root, 'content', 'messages')
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${locale}.json`)
  const existing = existsSync(path) ? readJson(path) : {}
  const prev = isRecord(existing) ? existing : {}

  const out: Record<string, unknown> = {}
  let translated = 0
  for (const [key, english] of Object.entries(fullEnglish)) {
    const value = typeof prev[key] === 'string' ? prev[key] : english
    out[key] = value
    if (value !== english) translated++
  }
  for (const key of Object.keys(prev)) {
    if (!(key in out)) {
      console.warn(
        `gen-translations: messages/${locale}.json: key "${key}" no longer exists in English — kept, please review`,
      )
      out[key] = prev[key]
    }
  }

  const changed = writeIfChanged(path, JSON.stringify(out, null, 2) + '\n')
  console.log(
    `${changed ? 'wrote  ' : 'current'} ${join('content/messages', `${locale}.json`)} — ${translated}/${Object.keys(fullEnglish).length} translated`,
  )
}

// ---------- markdown copies (texts + rituals) ----------

for (const locale of locales) {
  for (const kind of ['texts', 'rituals'] as const) {
    const manifest = readJson(join(dataDir, `${kind}.json`))
    if (!Array.isArray(manifest)) continue
    const enDir = join(root, 'content', kind)
    const localeDir = join(enDir, locale)
    mkdirSync(localeDir, { recursive: true })
    for (const entry of manifest) {
      if (!isRecord(entry) || typeof entry.slug !== 'string') continue
      const dest = join(localeDir, `${entry.slug}.md`)
      if (existsSync(dest)) {
        console.log(
          `current ${join('content', kind, locale, `${entry.slug}.md`)}`,
        )
        continue
      }
      const src = join(enDir, `${entry.slug}.md`)
      writeFileSync(dest, readFileSync(src, 'utf8'))
      console.log(
        `wrote   ${join('content', kind, locale, `${entry.slug}.md`)} (English copy — translate in place)`,
      )
    }
  }
}
