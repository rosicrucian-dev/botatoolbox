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

import source from '@content/texts/book-of-tokens.md?raw'
import sourceDe from '@content/texts/de/book-of-tokens.md?raw'

import { defineLocalized } from '@/content/data/localized'
import { DEFAULT_LOCALE, type TranslationLocale } from '@/lib/locales'

export interface Verse {
  /** Verse number as printed in the source (e.g. "0", "11"). */
  label: string
  /** Stanzas, each a list of poem lines. */
  stanzas: Array<Array<string>>
}

export interface Chapter {
  /** URL segment, e.g. "aleph". */
  slug: string
  title: string
  verses: Array<Verse>
}

const CHAPTER = /^##\s+(.+)$/
const VERSE = /^(\d{1,2})\.\s*$/

// Strip Markdown emphasis the OCR left in (e.g. the drop-cap `**H**`).
function plain(line: string): string {
  return line.replace(/\*\*?/g, '').trim()
}

function parse(md: string): Array<Chapter> {
  const chapters: Array<Chapter> = []
  let chapter: Chapter | null = null
  let verse: Verse | null = null
  let stanza: Array<string> = []

  const flushStanza = () => {
    if (stanza.length && verse) verse.stanzas.push(stanza)
    stanza = []
  }
  const flushVerse = () => {
    flushStanza()
    if (verse && chapter) chapter.verses.push(verse)
    verse = null
  }

  for (const raw of md.split('\n')) {
    const line = raw.replace(/\s+$/, '')
    if (
      line.trimStart().startsWith('<!--') ||
      line.trimStart().startsWith('-->')
    )
      continue

    const ch = line.match(CHAPTER)
    if (ch) {
      flushVerse()
      const title = ch[1].trim()
      chapter = { slug: title.toLowerCase(), title, verses: [] }
      chapters.push(chapter)
      continue
    }

    const v = line.trim().match(VERSE)
    if (v) {
      flushVerse()
      verse = { label: v[1], stanzas: [] }
      continue
    }

    if (line.trim() === '') {
      flushStanza()
      continue
    }

    // Content before any `N.` marker (e.g. Malkuth, which the source leaves
    // unnumbered) opens an implicit label-less verse.
    if (!verse) verse = { label: '', stanzas: [] }
    stanza.push(plain(line))
  }
  flushVerse()

  return chapters.filter((c) => c.verses.length > 0)
}

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
