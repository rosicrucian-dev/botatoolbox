// UI chrome translation. English lives in typed catalogs under ./en/
// (plus the nav strings in src/lib/nav-data.ts); German lives in the
// flat translator-edited content/messages/de.json, generated/synced by
// `npm run gen:translations` (English pre-filled; existing translations
// never overwritten). A missing key falls back to English — partial
// translation always ships — and unknown de.json keys warn at load.
//
// Two lookups:
//   t(locale, key)            — statically-known chrome keys (typed).
//   tDyn(locale, key, en)     — derived keys (nav.*, quiz.*) where the
//                               English text lives in code/data and the
//                               key is built at runtime.

import deRaw from '@content/messages/de.json'

import {
  DEFAULT_LOCALE,
  type Locale,
  type TranslationLocale,
} from '@/lib/locales'
import { navMessageEntries } from '@/lib/nav-data'

import { en, type MessageKey } from './en'

export type { MessageKey }

// Record<TranslationLocale, …>: adding a locale to LOCALES makes tsc
// flag the missing dictionary import here.
const dictionaries: Record<TranslationLocale, Record<string, string>> = {
  de: deRaw as Record<string, string>,
}

// Validate de.json once at module load: unknown keys are silently dead
// weight (likely a renamed English key) — warn, never throw.
{
  const known = new Set<string>([
    ...Object.keys(en),
    ...Object.keys(navMessageEntries()),
  ])
  for (const [locale, dict] of Object.entries(dictionaries)) {
    for (const key of Object.keys(dict)) {
      if (!known.has(key)) {
        console.warn(
          `[i18n] messages/${locale}.json: key "${key}" is not a known message — was the English key renamed? This translation no longer renders.`,
        )
      }
    }
  }
}

export function t(locale: Locale, key: MessageKey): string {
  if (locale === DEFAULT_LOCALE) return en[key]
  return dictionaries[locale as TranslationLocale]?.[key] ?? en[key]
}

/**
 * Lookup for derived keys (nav.*, quiz.*). `english` is the source
 * string from code/data and doubles as the fallback, so an unregistered
 * or untranslated key degrades to English instead of breaking.
 */
export function tDyn(locale: Locale, key: string, english: string): string {
  if (locale === DEFAULT_LOCALE) return english
  return dictionaries[locale as TranslationLocale]?.[key] ?? english
}
