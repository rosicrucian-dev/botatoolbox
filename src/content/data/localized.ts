// Per-locale dataset builder. Each data loader wraps its parse + derived
// views in defineLocalized() and exposes a `get<Domain>(locale)`
// accessor — the ONLY way to read data. There are deliberately no
// module-level English-pinned exports: locale-independent consumers
// (generateStaticParams, integrity, sitemap) call
// `get<Domain>(DEFAULT_LOCALE)` explicitly, so "this code reads English
// on purpose" is always visible at the call site.
//
// All locales build eagerly at module load — the data is small, and
// eager building keeps the fail-fast property of the current loaders
// (a bad overlay merge or Zod mismatch surfaces at build/boot, not on
// first German page view).

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/locales'

export function defineLocalized<T>(build: (locale: Locale) => T) {
  const cache = new Map<Locale, T>()
  for (const locale of LOCALES) cache.set(locale, build(locale))
  return (locale: Locale): T => cache.get(locale) ?? cache.get(DEFAULT_LOCALE)!
}
