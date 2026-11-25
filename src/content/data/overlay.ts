// Locale merge. Every language-carrying data file exists as a FULL,
// same-shaped copy per locale — content/data/en/<file>.json (the
// master) and content/data/<locale>/<file>.json siblings — so a
// translator sees exactly the file they know, with values to
// translate in place. The safety lives HERE, not in the file shapes:
// the merge reads STRUCTURE exclusively from English and takes only
// the whitelisted display fields (overlay-config.ts) from a translated
// file, matched by the entry's stable key. A translated file's
// structural fields are inert context — editing them warns and is
// IGNORED; a missing/mismatched record falls back to English wholesale.
//
// Failure philosophy: a translator's mistake (typo'd key, wrong type,
// edited structural field) WARNS and is skipped — it must never fail
// the build or change structure. The merged result still goes through
// the loader's strict Zod parse, which stays satisfied because
// structure is copied from English and only whitelisted display values
// are substituted.

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
// wholesale, object→merge subkeys that exist in English. Mismatches
// and unknown-to-English fields are skipped with a warning.
function mergeField(
  entry: Record<string, unknown>,
  field: string,
  value: unknown,
  target: OverlayTarget,
  where: string,
) {
  const en = entry[field]
  if (value === en) return // no-op (covers null === null attributions)
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
      // Structural fields ride along in the full-copy translation file
      // as inert context. Matching English exactly → silence; edited →
      // warn and IGNORE (English structure always wins).
      if (JSON.stringify(value) !== JSON.stringify(enEntry[field])) {
        warn(
          target,
          `${where}: "${field}" is structural — the edit is ignored (English wins)`,
        )
      }
      continue
    }
    mergeField(merged, field, value, target, where)
  }
  return merged
}

/**
 * Loader-facing entry point. Translated-locale JSON lives in the
 * central registry (./overlays.ts — the ONE place locale files are
 * imported); each loader imports its own content/data/en/<file>.json
 * (the master) and builds a raw-rows getter:
 *
 *   const rawFor = localizedRaw('tarot', english)
 *   const rows = z.array(Schema).parse(rawFor(locale))
 *
 * English passes through untouched; a translated locale's full-copy
 * file is merged over it (structure from English, whitelisted display
 * fields from the translation, everything else falls back).
 */
export function localizedRaw<T>(
  file: string,
  english: readonly T[],
): (locale: Locale) => readonly T[] {
  const target = overlayTargetByFile.get(file)
  if (!target)
    throw new Error(`localizedRaw: "${file}" is not in overlay-config.ts`)
  const byLocale = overlays[file]
  return (locale) =>
    locale === DEFAULT_LOCALE
      ? english
      : mergeOverlay(english, byLocale?.[locale as TranslationLocale], target)
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

  if (!Array.isArray(overlay)) {
    if (overlay !== undefined && overlay !== null) {
      warn(target, 'translation file should be an array (a full sibling copy)')
    }
    return [...en]
  }

  if (keying.kind === 'index') {
    if (overlay.length !== en.length) {
      warn(
        target,
        `translation has ${overlay.length} rows but English has ${en.length} — extra/missing rows ignored`,
      )
    }
    return en.map(
      (entry, i) => mergeEntry(entry, overlay[i], target, `row ${i + 1}`) as T,
    )
  }

  // Key the translated rows so reordering/deletion can't shift meaning.
  function byField(
    rows: unknown[],
    field: string,
    what: string,
  ): Map<string, unknown> {
    const map = new Map<string, unknown>()
    for (const row of rows) {
      if (isRecord(row)) map.set(String(row[field]), row)
    }
    if (map.size !== rows.length) {
      warn(target, `${what}: duplicate or malformed keys — later rows win`)
    }
    return map
  }

  if (keying.kind === 'field') {
    const ovByKey = byField(overlay, keying.field, 'translation')
    const seen = new Set<string>()
    const merged = en.map((entry) => {
      if (!isRecord(entry)) return entry
      const key = String(entry[keying.field])
      seen.add(key)
      const ov = ovByKey.get(key)
      if (ov === undefined) return entry
      return mergeEntry(entry, ov, target, `"${key}"`) as T
    })
    for (const key of ovByKey.keys()) {
      if (!seen.has(key)) {
        warn(target, `entry "${key}" doesn't exist in English — skipped`)
      }
    }
    return merged
  }

  // nested (minor-arcana): translated file = array of groups, each with
  // a child array — same shape as English. Groups pair by `groupBy`,
  // children by `childKey`.
  const ovGroups = byField(overlay, keying.groupBy, 'translation groups')
  const merged = en.map((group) => {
    if (!isRecord(group)) return group
    const groupKey = String(group[keying.groupBy])
    const ovGroup = ovGroups.get(groupKey)
    ovGroups.delete(groupKey)
    if (!isRecord(ovGroup)) return group
    const children = group[keying.childList]
    const ovChildren = ovGroup[keying.childList]
    if (!Array.isArray(children) || !Array.isArray(ovChildren)) return group
    const ovByChild = byField(
      ovChildren,
      keying.childKey,
      `"${groupKey}" children`,
    )
    const mergedChildren = children.map((child) => {
      if (!isRecord(child)) return child
      const childKey = String(child[keying.childKey])
      const ovChild = ovByChild.get(childKey)
      ovByChild.delete(childKey)
      if (ovChild === undefined) return child
      return mergeEntry(child, ovChild, target, `"${groupKey}" ${childKey}`)
    })
    for (const key of ovByChild.keys()) {
      warn(target, `"${groupKey}" ${key} doesn't exist in English — skipped`)
    }
    return { ...group, [keying.childList]: mergedChildren } as T
  })
  for (const key of ovGroups.keys()) {
    warn(target, `group "${key}" doesn't exist in English — skipped`)
  }
  return merged
}
