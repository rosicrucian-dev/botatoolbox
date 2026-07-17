// The Pattern on the Trestleboard — parses the Markdown source. Each
// numbered list item becomes a statement; the line's prefix label is
// preserved verbatim so the docs page can show what the source shows.
//
// German comes from content/texts/de/pattern-trestleboard.md (an
// English copy until translated — gen-translations guarantees it
// exists, so the ?raw import always resolves). The statement count must
// match the English file; on mismatch we warn and show English.

import sourceDe from '@content/texts/de/pattern-trestleboard.md?raw'
import source from '@content/texts/pattern-trestleboard.md?raw'

import { defineLocalized } from '@/content/data/localized'
import { DEFAULT_LOCALE, type TranslationLocale } from '@/lib/locales'

export interface Statement {
  label: string
  text: string
}

const STEP_LINE = /^([^\s.]+)\.\s+(.+)$/

function parse(md: string): Array<Statement> {
  const out: Array<Statement> = []
  for (const raw of md.split('\n')) {
    const m = raw.trim().match(STEP_LINE)
    if (m) out.push({ label: m[1], text: m[2] })
  }
  return out
}

const enStatements: ReadonlyArray<Statement> = parse(source)

// Record<TranslationLocale, …>: adding a locale to LOCALES makes tsc
// flag the missing source here.
const SOURCES: Record<TranslationLocale, string> = { de: sourceDe }

export const getPatternTrestleboard = defineLocalized((locale) => {
  const src =
    locale === DEFAULT_LOCALE ? undefined : SOURCES[locale as TranslationLocale]
  if (src) {
    const parsed = parse(src)
    if (parsed.length === enStatements.length) return { statements: parsed }
    console.warn(
      `[i18n] pattern-trestleboard (${locale}): ${parsed.length} statements vs ${enStatements.length} in English — check the numbered lines; using English`,
    )
  }
  return { statements: enStatements }
})
