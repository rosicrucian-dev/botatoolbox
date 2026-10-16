// Server-only helper for reading localized prose markdown. Every
// locale has its own directory — content/<kind>/<locale>/<slug>.md —
// because prose translates as full parallel copies (unlike the data
// overlays; see content/data/README.md). English is the fallback: a
// missing translation file falls back to content/<kind>/en/<slug>.md,
// so partially translated content always renders. Skeletons come from
// `npm run gen:translations`.
//
// Kept out of src/content/data/ on purpose: this touches node:fs, and
// the data barrel must stay safe to import from client components.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { DEFAULT_LOCALE, type Locale } from '@/lib/locales'

export function readLocalizedMarkdown(
  kind: 'texts' | 'rituals' | 'recordings',
  locale: Locale,
  slug: string,
): string {
  if (locale !== DEFAULT_LOCALE) {
    const localized = join(process.cwd(), 'content', kind, locale, `${slug}.md`)
    if (existsSync(localized)) return readFileSync(localized, 'utf8')
  }
  return readFileSync(
    join(process.cwd(), 'content', kind, DEFAULT_LOCALE, `${slug}.md`),
    'utf8',
  )
}
