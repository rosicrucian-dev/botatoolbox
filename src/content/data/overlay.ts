// Translation-overlay merge. Applies a per-locale overlay file
// (content/data/<locale>/<file>.json — only whitelisted display fields,
// keyed per overlay-config.ts) over the English data BEFORE the Zod
// parse in each loader, falling back to English for anything missing.
//
// Failure philosophy: a translator's mistake (typo'd key, wrong type,
// extra field) WARNS and is skipped — it must never fail the build or
// change structure. The merged result still goes through the loader's
// strict Zod parse, which stays satisfied because structure is copied
// from English and only whitelisted display values are substituted.

import {
  DEFAULT_LOCALE,
  type Locale,
  type TranslationLocale,
} from '@/lib/locales'

import { overlayTargetByFile, type OverlayTarget } from './overlay-config'
import { overlays } from './overlays'

function warn(target: OverlayTarget, msg: string) {
  console.warn(`[i18n] ${target.file}: ${msg}`)
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// Merge one whitelisted field's overlay value onto a cloned entry. The
// English value is the type authority: string→replace, array→replace
// wholesale, object→merge subkeys that exist in English. Mismatches and
// unknown-to-English fields are skipped with a warning.
function mergeField(
  entry: Record<string, unknown>,
  field: string,
  value: unknown,
  target: OverlayTarget,
  where: string,
) {
  const en = entry[field]
  if (en === undefined) {
    warn(target, `${where}: field "${field}" not present in English — skipped`)
    return
  }
  if (typeof en === 'string') {
    if (typeof value === 'string') entry[field] = value
    else warn(target, `${where}: "${field}" should be a string — skipped`)
    return
  }
  if (Array.isArray(en)) {
    if (Array.isArray(value)) entry[field] = value
    else warn(target, `${where}: "${field}" should be an array — skipped`)
    return
  }
  if (isRecord(en)) {
    if (!isRecord(value)) {
      warn(target, `${where}: "${field}" should be an object — skipped`)
      return
    }
    const merged = { ...en }
    for (const [k, v] of Object.entries(value)) {
      if (!(k in en)) {
        warn(target, `${where}: unknown subfield "${field}.${k}" — skipped`)
      } else if (typeof v === typeof en[k]) {
        merged[k] = v
      } else {
        warn(target, `${where}: "${field}.${k}" has the wrong type — skipped`)
      }
    }
    entry[field] = merged
    return
  }
  warn(target, `${where}: "${field}" is not a translatable shape — skipped`)
}

function mergeEntry(
  enEntry: unknown,
  ovEntry: unknown,
  target: OverlayTarget,
  where: string,
): unknown {
  // Tuple rows (pillars): the whole entry is replaced when the overlay
  // row is an array of the same length.
  if (Array.isArray(enEntry)) {
    if (Array.isArray(ovEntry) && ovEntry.length === enEntry.length) {
      return ovEntry
    }
    warn(
      target,
      `${where}: expected an array of length ${(enEntry as unknown[]).length} — skipped`,
    )
    return enEntry
  }
  if (!isRecord(enEntry)) return enEntry
  if (!isRecord(ovEntry)) {
    warn(target, `${where}: expected an object — skipped`)
    return enEntry
  }
  const merged: Record<string, unknown> = { ...enEntry }
  for (const [field, value] of Object.entries(ovEntry)) {
    if (!target.fields.includes(field)) {
      warn(target, `${where}: field "${field}" is not translatable — skipped`)
      continue
    }
    mergeField(merged, field, value, target, where)
  }
  return merged
}

/**
 * Loader-facing entry point. Per-locale overlay JSON lives in the
 * central registry (./overlays.ts — the ONE place locale files are
 * imported); each loader builds a raw-rows getter:
 *
 *   const rawFor = localizedRaw('tarot', data)
 *   const rows = z.array(Schema).parse(rawFor(locale))
 *
 * English passes through untouched (provably identical to the source
 * JSON); other locales get their overlay merged over a copy.
 */
export function localizedRaw<T>(
  file: string,
  en: readonly T[],
): (locale: Locale) => readonly T[] {
  const target = overlayTargetByFile.get(file)
  if (!target)
    throw new Error(`localizedRaw: "${file}" is not in overlay-config.ts`)
  const byLocale = overlays[file]
  return (locale) =>
    locale === DEFAULT_LOCALE
      ? en
      : mergeOverlay(en, byLocale?.[locale as TranslationLocale], target)
}

/**
 * Deep-merge a locale overlay over the English rows. `en` is the raw
 * (pre-Zod) English JSON array; the return value is a new array with
 * overlay values substituted — pass it to the loader's Zod parse.
 * Any overlay problem warns and falls back to English.
 */
export function mergeOverlay<T>(
  en: readonly T[],
  overlay: unknown,
  target: OverlayTarget,
): T[] {
  const { keying } = target

  if (keying.kind === 'index') {
    if (!Array.isArray(overlay)) {
      if (overlay !== undefined && overlay !== null) {
        warn(target, 'overlay should be an array (merged by position)')
      }
      return [...en]
    }
    if (overlay.length !== en.length) {
      warn(
        target,
        `overlay has ${overlay.length} rows but English has ${en.length} — extra/missing rows ignored`,
      )
    }
    return en.map(
      (entry, i) => mergeEntry(entry, overlay[i], target, `row ${i + 1}`) as T,
    )
  }

  if (!isRecord(overlay)) {
    if (overlay !== undefined && overlay !== null) {
      warn(target, 'overlay should be an object keyed by entry key')
    }
    return [...en]
  }

  if (keying.kind === 'field') {
    const seen = new Set<string>()
    const merged = en.map((entry) => {
      if (!isRecord(entry)) return entry
      const key = String(entry[keying.field])
      seen.add(key)
      const ov = overlay[key]
      if (ov === undefined) return entry
      return mergeEntry(entry, ov, target, `"${key}"`) as T
    })
    for (const key of Object.keys(overlay)) {
      if (!seen.has(key)) {
        warn(target, `key "${key}" doesn't exist in English — skipped`)
      }
    }
    return merged
  }

  // nested (minor-arcana): { "<group>": { "<childKey>": {…fields} } }
  const seenGroups = new Set<string>()
  const merged = en.map((group) => {
    if (!isRecord(group)) return group
    const groupKey = String(group[keying.groupBy])
    seenGroups.add(groupKey)
    const ovGroup = overlay[groupKey]
    if (ovGroup === undefined) return group
    if (!isRecord(ovGroup)) {
      warn(
        target,
        `"${groupKey}" should be an object keyed by ${keying.childKey}`,
      )
      return group
    }
    const children = group[keying.childList]
    if (!Array.isArray(children)) return group
    const seenChildren = new Set<string>()
    const mergedChildren = children.map((child) => {
      if (!isRecord(child)) return child
      const childKey = String(child[keying.childKey])
      seenChildren.add(childKey)
      const ovChild = ovGroup[childKey]
      if (ovChild === undefined) return child
      return mergeEntry(child, ovChild, target, `"${groupKey}" ${childKey}`)
    })
    for (const key of Object.keys(ovGroup)) {
      if (!seenChildren.has(key)) {
        warn(target, `"${groupKey}" ${key} doesn't exist in English — skipped`)
      }
    }
    return { ...group, [keying.childList]: mergedChildren } as T
  })
  for (const key of Object.keys(overlay)) {
    if (!seenGroups.has(key)) {
      warn(target, `group "${key}" doesn't exist in English — skipped`)
    }
  }
  return merged
}
