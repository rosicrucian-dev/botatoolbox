// The Book of Tokens — parses the Markdown source into chapters of
// numbered verses. Each `## Title` starts a chapter; a line that is just
// `N.` opens verse N; blank lines within a verse separate stanzas, and
// every other line is one line of the poem. Only the meditations are in
// the source — the commentary, footnotes, and page furniture were
// stripped from the OCR. See content/texts/book-of-tokens.md.
//
// German comes from content/texts/de/book-of-tokens.md (an English copy
// until translated — gen-translations guarantees it exists, so the ?raw
// import always resolves). Chapter slugs/URLs ALWAYS come from the
// English parse; translated chapters pair up by position, so headings
// may be translated freely as long as the chapter/verse structure stays
// identical to the English file.

import source from '@content/texts/en/book-of-tokens.md?raw'
import sourceDe from '@content/texts/de/book-of-tokens.md?raw'

import { defineLocalized } from '@/content/data/localized'
import {
  parse,
  type Chapter,
  type Verse,
} from '@/content/texts/book-of-tokens-parse'
import { DEFAULT_LOCALE, type TranslationLocale } from '@/lib/locales'

export type { Chapter, Verse }

const enChapters: ReadonlyArray<Chapter> = parse(source)

// Record<TranslationLocale, …>: adding a locale to LOCALES makes tsc
// flag the missing source here.
const SOURCES: Record<TranslationLocale, string> = { de: sourceDe }

export const getBookOfTokens = defineLocalized((locale) => {
  let localized = enChapters
  const src =
    locale === DEFAULT_LOCALE ? undefined : SOURCES[locale as TranslationLocale]
  if (src) {
    const parsed = parse(src)
    if (parsed.length !== enChapters.length) {
      console.warn(
        `[i18n] book-of-tokens (${locale}): ${parsed.length} chapters vs ${enChapters.length} in English — structure must match; using English`,
      )
    } else {
      localized = parsed.map((c, i) => {
        const en = enChapters[i]
        if (c.verses.length !== en.verses.length) {
          console.warn(
            `[i18n] book-of-tokens (${locale}): chapter "${en.title}" has ${c.verses.length} verses vs ${en.verses.length} in English — check the verse-number lines`,
          )
        }
        // URL slug stays English — pages are parallel across locales.
        return { ...c, slug: en.slug }
      })
    }
  }
  const chapterBySlug: Readonly<Record<string, Chapter>> = Object.fromEntries(
    localized.map((c) => [c.slug, c]),
  )
  return { chapters: localized, chapterBySlug }
})
