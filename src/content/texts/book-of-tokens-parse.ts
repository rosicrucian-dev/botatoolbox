// Pure Markdown parser for The Book of Tokens — no ?raw imports, no aliases,
// so it can be imported both by the browser module (book-of-tokens.ts, which
// feeds it the ?raw sources) and by the Node index generator
// (scripts/gen-book-of-tokens-search.ts, which reads the .md files with fs).
//
// Each `## Title` starts a chapter; a line that is just `N.` opens verse N;
// blank lines within a verse separate stanzas, and every other line is one
// line of the poem. Malkuth is left unnumbered in the source and parses as a
// single label-less verse.
//
// A `### Comment` heading within a chapter switches to its commentary: the
// same `N.`-per-line note structure (each note keyed to the meditation verse
// it discusses), but prose rather than poetry — so its emphasis (`*Ruach*`) is
// preserved for the renderer to italicize, and blank-separated paragraphs
// within a note become its stanzas.

export interface Verse {
  /** Verse number as printed in the source (e.g. "0", "11"). */
  label: string
  /** Stanzas, each a list of lines (poem lines, or prose paragraphs). */
  stanzas: Array<Array<string>>
}

export interface Chapter {
  /** URL segment, e.g. "aleph". */
  slug: string
  title: string
  verses: Array<Verse>
  /** Verse-keyed commentary notes; empty when a chapter has no comment. */
  comment: Array<Verse>
}

const CHAPTER = /^##\s+(.+)$/
const COMMENT = /^###\s+Comment\s*$/
// A verse/note marker: a number alone on a line. Comment notes may key two
// verses at once ("5–6."), so allow that compact range form too.
const VERSE = /^(\d{1,2}(?:–\d{1,2})?)\.\s*$/

// Strip Markdown emphasis the OCR left in (e.g. the drop-cap `**H**`).
function plain(line: string): string {
  return line.replace(/\*\*?/g, '').trim()
}

export function parse(md: string): Array<Chapter> {
  const chapters: Array<Chapter> = []
  let chapter: Chapter | null = null
  let verse: Verse | null = null
  let stanza: Array<string> = []
  let inComment = false

  const flushStanza = () => {
    if (stanza.length && verse) verse.stanzas.push(stanza)
    stanza = []
  }
  const flushVerse = () => {
    flushStanza()
    if (verse && chapter) {
      ;(inComment ? chapter.comment : chapter.verses).push(verse)
    }
    verse = null
  }

  for (const raw of md.split('\n')) {
    const line = raw.replace(/\s+$/, '')
    if (
      line.trimStart().startsWith('<!--') ||
      line.trimStart().startsWith('-->')
    )
      continue

    if (COMMENT.test(line)) {
      flushVerse()
      inComment = true
      continue
    }

    const ch = line.match(CHAPTER)
    if (ch) {
      flushVerse()
      inComment = false
      const title = ch[1].trim()
      chapter = { slug: title.toLowerCase(), title, verses: [], comment: [] }
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
    // unnumbered, or a comment's unnumbered preamble) opens a label-less note.
    if (!verse) verse = { label: '', stanzas: [] }
    // Comment prose keeps its emphasis for the renderer; poetry is stripped.
    stanza.push(inComment ? line.trim() : plain(line))
  }
  flushVerse()

  return chapters.filter((c) => c.verses.length > 0)
}
