// The Book of Tokens — parses the Markdown source into chapters of
// numbered verses. Each `## Title` starts a chapter; a line that is just
// `N.` opens verse N; blank lines within a verse separate stanzas, and
// every other line is one line of the poem. Only the meditations are in
// the source — the commentary, footnotes, and page furniture were
// stripped from the OCR. See content/texts/book-of-tokens.md.

import source from '@content/texts/book-of-tokens.md?raw'

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
    if (line.trimStart().startsWith('<!--') || line.trimStart().startsWith('-->'))
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

export const chapters: ReadonlyArray<Chapter> = parse(source)

export const chapterBySlug: Readonly<Record<string, Chapter>> =
  Object.fromEntries(chapters.map((c) => [c.slug, c]))
