// Generates/refreshes the per-locale translation skeletons the
// translator edits:
//
//   content/data/<locale>/<file>.json   — a FULL sibling copy of the
//     English file (content/data/en/<file>.json), display fields
//     pre-filled with English for translating in place. Rerunning
//     RESYNCS structure from English while preserving every translated
//     display value (matched by each entry's stable key); entries gone
//     from English are dropped with a warning. Structural edits in a
//     translation are overwritten here and ignored by the runtime merge
//     — translators cannot break the site.
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
import { DEFAULT_LOCALE, LOCALES } from '../src/lib/locales.ts'

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

// One entry's skeleton: a full copy of the English record, with any
// previously translated display-field values carried over (matched by
// the entry's stable key — see overlay-config.ts). Object display
// fields (minor-arcana `meaning`) merge subkey-wise so a new English
// subkey appears without clobbering translated siblings. Structural
// fields always come fresh from English — the resync is what keeps a
// translation file's inert context from rotting.
function entrySkeleton(
  en: Record<string, unknown>,
  prevEntry: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  const prev = isRecord(prevEntry) ? prevEntry : {}
  const out: Record<string, unknown> = { ...en }
  for (const field of fields) {
    const enValue = en[field]
    const prevValue = prev[field]
    if (enValue === undefined || prevValue === undefined) continue
    if (isRecord(enValue) && isRecord(prevValue)) {
      const merged: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(enValue)) {
        merged[k] = prevValue[k] !== undefined ? prevValue[k] : v
      }
      out[field] = merged
    } else {
      out[field] = prevValue
    }
  }
  return out
}

// Rough translation progress: a display-field leaf counts as translated
// when it differs from the current English value. Structural fields are
// excluded — they're supposed to match.
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

function pickFields(
  entry: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (!isRecord(entry)) return {}
  const out: Record<string, unknown> = {}
  for (const f of fields) if (entry[f] !== undefined) out[f] = entry[f]
  return out
}

function keyRows(rows: unknown[], field: string): Map<string, unknown> {
  const map = new Map<string, unknown>()
  for (const row of rows) {
    if (isRecord(row)) map.set(String(row[field]), row)
  }
  return map
}

// Build a locale's full-copy skeleton from the English rows + whatever
// the locale file already holds. Progress is measured over display
// fields only.
function buildSkeleton(
  target: OverlayTarget,
  enRows: unknown[],
  existing: unknown,
): { skeleton: unknown[]; total: number; translated: number } {
  const { keying, fields } = target
  const prevRows = Array.isArray(existing) ? existing : []
  let total = 0
  let translated = 0

  function tally(row: Record<string, unknown>, en: Record<string, unknown>) {
    const c = countLeaves(pickFields(row, fields), pickFields(en, fields))
    total += c.total
    translated += c.translated
  }

  if (keying.kind === 'index') {
    const skeleton = enRows.map((row, i) => {
      const prev = prevRows[i]
      if (Array.isArray(row)) {
        // pillars-style tuple rows: previous translation wins wholesale.
        const kept =
          Array.isArray(prev) && prev.length === row.length ? prev : row
        const c = countLeaves(kept, row)
        total += c.total
        translated += c.translated
        return kept
      }
      if (!isRecord(row)) return row
      const out = entrySkeleton(row, prev, fields)
      tally(out, row)
      return out
    })
    if (prevRows.length > enRows.length) {
      console.warn(
        `gen-translations: ${target.file}: ${prevRows.length - enRows.length} extra row(s) no longer in English — dropped (positional file)`,
      )
    }
    return { skeleton, total, translated }
  }

  if (keying.kind === 'field') {
    const prevBy = keyRows(prevRows, keying.field)
    const skeleton = enRows.map((row) => {
      if (!isRecord(row)) return row
      const key = String(row[keying.field])
      const out = entrySkeleton(row, prevBy.get(key), fields)
      prevBy.delete(key)
      tally(out, row)
      return out
    })
    for (const key of prevBy.keys()) {
      console.warn(
        `gen-translations: ${target.file}: entry "${key}" no longer exists in English — dropped (its structure came from English; re-translate under the new key if it was renamed)`,
      )
    }
    return { skeleton, total, translated }
  }

  // nested (minor-arcana)
  const prevGroups = keyRows(prevRows, keying.groupBy)
  const skeleton = enRows.map((group) => {
    if (!isRecord(group)) return group
    const prevGroup = prevGroups.get(String(group[keying.groupBy]))
    const children = group[keying.childList]
    if (!Array.isArray(children)) return group
    const prevChildren =
      isRecord(prevGroup) && Array.isArray(prevGroup[keying.childList])
        ? keyRows(prevGroup[keying.childList] as unknown[], keying.childKey)
        : new Map<string, unknown>()
    return {
      ...group,
      [keying.childList]: children.map((child) => {
        if (!isRecord(child)) return child
        const out = entrySkeleton(
          child,
          prevChildren.get(String(child[keying.childKey])),
          fields,
        )
        tally(out, child)
        return out
      }),
    }
  })
  return { skeleton, total, translated }
}

// ---------- data files (full sibling copies per locale) ----------

for (const locale of locales) {
  const localeDir = join(dataDir, locale)
  mkdirSync(localeDir, { recursive: true })

  for (const target of overlayTargets) {
    const enData = readJson(join(dataDir, DEFAULT_LOCALE, `${target.file}.json`))
    if (!Array.isArray(enData)) continue
    const path = join(localeDir, `${target.file}.json`)
    const existing = existsSync(path) ? readJson(path) : undefined

    const { skeleton, total, translated } = buildSkeleton(
      target,
      enData,
      existing,
    )
    const changed = writeIfChanged(
      path,
      JSON.stringify(skeleton, null, 2) + '\n',
    )
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

// en.json IS the English source (nav titles included) — sync straight
// from it.
const fullEnglish = readJson(
  join(root, 'content', 'messages', `${DEFAULT_LOCALE}.json`),
) as Record<string, string>

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
    const enDir = join(root, 'content', kind, DEFAULT_LOCALE)
    const localeDir = join(root, 'content', kind, locale)
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
