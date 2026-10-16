// UI chrome translation. content/messages/<locale>.json are FULL
// sibling files — en.json is the source (every chrome string, nav
// titles included), translated locales are the same file with values
// translated in place, synced by `npm run gen:translations`. A missing
// translated key falls back to English — partial translation always
// ships — and unknown keys in a translated file warn at load.
//
// Three lookups:
//   t(locale, key)     — statically-known keys (typed MessageKey).
//   tKey(locale, key)  — dynamically-built keys (nav.*, quiz.*):
//                        translated value, else English, else
//                        undefined (caller decides the fallback).
//   tDyn(locale, key, english) — dynamic key with a code-supplied
//                        English fallback (used where the English text
//                        legitimately lives in data/code).

import deRaw from '@content/messages/de.json'
import enRaw from '@content/messages/en.json'

import {
  DEFAULT_LOCALE,
  type Locale,
  type TranslationLocale,
} from '@/lib/locales'

export const en: Record<string, string> = enRaw
export type MessageKey = keyof typeof enRaw

const dictionaries: Record<TranslationLocale, Record<string, string>> = {
  de: deRaw as Record<string, string>,
}

// Validate translated files once at module load: unknown keys are
// silently dead weight (likely a renamed English key) — warn, never
// throw.
{
  for (const [locale, dict] of Object.entries(dictionaries)) {
    for (const key of Object.keys(dict)) {
      if (!(key in enRaw)) {
        console.warn(
          `[i18n] messages/${locale}.json: key "${key}" is not in en.json — was the English key renamed? This translation no longer renders.`,
        )
      }
    }
  }
}

export function t(locale: Locale, key: MessageKey): string {
  if (locale === DEFAULT_LOCALE) return en[key]
  return dictionaries[locale as TranslationLocale]?.[key] ?? en[key]
}

export function tKey(locale: Locale, key: string): string | undefined {
  if (locale !== DEFAULT_LOCALE) {
    const translated = dictionaries[locale as TranslationLocale]?.[key]
    if (translated !== undefined) return translated
  }
  return en[key]
}

export function tDyn(locale: Locale, key: string, english: string): string {
  if (locale === DEFAULT_LOCALE) return english
  return dictionaries[locale as TranslationLocale]?.[key] ?? english
}
