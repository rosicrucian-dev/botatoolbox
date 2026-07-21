// One-off: pull each letter's "Comment on <X>" out of the raw OCR
// (local/ocr/booktokens.pdf/markdown.md) and splice it into the hand-corrected
// meditation text as a `### Comment` section per chapter.
//
//   node --experimental-strip-types scripts/extract-book-of-tokens-comments.ts
//
// Idempotent: strips any existing `### Comment` sections first, then re-inserts
// from the OCR, so it can be re-run after tuning the cleaner. The OCR is messy
// (running headers, page numbers, card images, hyphenation, page-split
// duplicates) so the OUTPUT IS A DRAFT — proofread against booktokens.pdf.
//
// English only; the German file is a verbatim English placeholder (like the
// meditations), so it's overwritten with the same content until translated.
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OCR = join(ROOT, 'local/ocr/booktokens.pdf/markdown.md')
const EN = join(ROOT, 'content/texts/en/book-of-tokens.md')
const DE = join(ROOT, 'content/texts/de/book-of-tokens.md')

const ocr = readFileSync(OCR, 'utf8')
const ocrLines = ocr.split('\n')

// Boundaries in the OCR: a comment for letter X runs from `# COMMENT ON X` to
// the next meditation heading (or the Epilogos, after the last letter Tav).
const MEDITATION = /^#+\s+(THE\s+)?MEDITATION ON /i
const EPILOGOS = /^#+\s+EPILOGOS\b/i
const COMMENT_HEAD = /^#+\s+COMMENT ON ([A-Z][A-Z ]*[A-Z])\s*$/

/** Furniture lines that never belong to the commentary prose. */
function isFurniture(line: string): boolean {
  const t = line.trim()
  if (t === '') return false // blank handled by paragraph grouping
  return (
    /^#/.test(t) || // any heading (running heads, spaced-caps, COMMENT ON…)
    /^\\?\*(\s+\\?\*){2,}/.test(t) || // `* * * *` / `\* \* \* \*` dividers
    /^!\[/.test(t) || // image tags
    /^\[?\d{1,3}\]?$/.test(t) || // lone page numbers: `3`, `[37]`
    /[֐-׿]/.test(t) || // Hebrew letter captions
    // Tarot-card captions and other all-caps furniture beside the page
    // illustrations — e.g. "6 THE LOVERS", "9 THE HERMIT 9", "WHEEL'S FORTUNE",
    // "TEMPERANCE". Any short line with letters but no lowercase (the leading/
    // trailing key number rides along). Real notes are mixed-case sentences;
    // Gematria letter-strings ("N Ch Sh") only ever appear mid-sentence.
    (t.length < 40 && /[A-Z]/.test(t) && !/[a-z]/.test(t))
  )
}

/** Collect the raw comment-region lines for every letter. */
function commentRegions(): Map<string, string[]> {
  const regions = new Map<string, string[]>()
  let active: string | null = null
  let buf: string[] = []
  const flush = () => {
    if (active && buf.length) {
      // Multiple `# COMMENT ON X` headings (OCR page splits) accumulate into
      // the same letter's region.
      const prev = regions.get(active) ?? []
      regions.set(active, prev.concat(buf))
    }
    buf = []
  }
  for (const line of ocrLines) {
    const head = line.match(COMMENT_HEAD)
    if (head) {
      const letter = head[1].replace(/\s+/g, '') // `C O M M E N T`… never matches; real names do
      flush()
      active = letter
      continue
    }
    if (active && (MEDITATION.test(line) || EPILOGOS.test(line))) {
      flush()
      active = null
      continue
    }
    if (active) buf.push(line)
  }
  flush()
  return regions
}

/** Clean a region into `### Comment` note markdown (drafts; needs proofing). */
function cleanRegion(lines: string[]): string {
  // 0. Remove the attribution table: the span from the "…, pronounced …" (or
  //    "Transcribed as …") line through the "…Intelligence." / "…Activities."
  //    descriptor that closes it — across any blank lines the OCR left between
  //    rows (some tables are contiguous, some double-spaced) and any wrapping
  //    of the descriptor (Teth's "…Secret of / All Spiritual Activities.").
  const t0 = lines.findIndex(
    (l) => /,\s+pronounced\b/i.test(l) || /^\s*\**Transcribed as\b/i.test(l),
  )
  if (t0 !== -1) {
    // The table closes with its "Intelligence" descriptor, which always starts
    // with "The" and names an Intelligence — "The Luminous Intelligence.", "The
    // Intelligence of the House of Influence.", etc. Find that line…
    let end = -1
    for (let i = t0; i < lines.length && i < t0 + 12; i++) {
      if (/^\s*\**The\b.*Intelligence/i.test(lines[i])) {
        end = i
        break
      }
    }
    if (end !== -1) {
      // …and absorb a wrapped continuation when it doesn't end in a period
      // (Teth: "The Intelligence of the Secret of" / "All Spiritual Activities.").
      if (!/\.\s*$/.test(lines[end])) {
        let j = end + 1
        while (j < lines.length && lines[j].trim() === '') j++
        if (j < lines.length && /\.\s*$/.test(lines[j])) end = j
      }
      lines = lines.slice(0, t0).concat(lines.slice(end + 1))
    }
  }

  // 1. Drop furniture, keep blanks as paragraph separators.
  const kept = lines.filter((l) => !isFurniture(l))

  // 2. De-hyphenate line-wrap breaks (`expres-` + `sion`, across blanks too).
  const merged: string[] = []
  for (let i = 0; i < kept.length; i++) {
    let cur = kept[i]
    while (/[A-Za-z]-$/.test(cur.trim())) {
      let j = i + 1
      while (j < kept.length && kept[j].trim() === '') j++
      if (j >= kept.length || !/^[a-z]/.test(kept[j].trim())) break
      cur = cur.trim().replace(/-$/, '') + kept[j].trim()
      kept.splice(i + 1, j - i) // consume the joined line + any blanks between
    }
    merged.push(cur)
  }

  // 3. Identify note-key lines: a verse number (with or without a period — the
  //    OCR mixes "1." and "6"), then a capital, quote, or emphasis marker. The
  //    number may span two verses ("5 and 6 …"). Detecting keys per LINE (not
  //    per blank-separated paragraph) is essential: some notes sit on adjacent
  //    lines with no blank between (Ayin's 4/5), which paragraph-grouping would
  //    merge — silently swallowing the second note's number.
  const KEY = /^(\d{1,2}(?:\s+and\s+\d{1,2})?)\.?\s+["“‘'*A-Z]/
  const isKey = merged.map((l) => KEY.test(l.trim()))

  // A run of 3+ consecutive key lines *can* be an inline enumeration (Beth
  // lists the ten Sephiroth one per line: "1. KETHER;" / … "10. MALKUTH.") —
  // but terse real notes also sit on consecutive lines (Shin's 2–5). Suppress
  // the run only when it's list-shaped: most items end with ";" or begin with
  // an ALL-CAPS name. Real notes are full sentences ending in ".".
  for (let i = 0; i < isKey.length; ) {
    if (!isKey[i]) {
      i++
      continue
    }
    let j = i
    while (j < isKey.length && isKey[j]) j++
    if (j - i >= 3) {
      let listish = 0
      for (let k = i; k < j; k++) {
        const t = merged[k].trim()
        if (/;\s*$/.test(t) || /^\d{1,2}\.?\s+[A-Z]{2,}/.test(t)) listish++
      }
      if (listish > (j - i) / 2) for (let k = i; k < j; k++) isKey[k] = false
    }
    i = j
  }

  // 4. Walk the lines into notes: a key line opens a note; a blank line ends a
  //    paragraph; every other line continues the current paragraph.
  type Note = { label: string; paras: string[] }
  const notes: Note[] = []
  let cur: Note | null = null
  let paraLines: string[] = []
  const flushPara = () => {
    if (paraLines.length && cur) {
      cur.paras.push(paraLines.join(' ').replace(/\s+/g, ' ').trim())
    }
    paraLines = []
  }
  merged.forEach((line, idx) => {
    const t = line.trim()
    if (isKey[idx]) {
      flushPara()
      if (cur) notes.push(cur)
      const m = t.match(/^(\d{1,2}(?:\s+and\s+\d{1,2})?)\.?\s+(.*)$/)!
      // Compact a two-verse key ("5 and 6") to "5–6" so it fits the label column.
      cur = { label: m[1].replace(/\s+and\s+/, '–'), paras: [] }
      paraLines = [m[2]]
    } else if (t === '') {
      flushPara()
    } else {
      if (!cur) cur = { label: '', paras: [] }
      paraLines.push(t)
    }
  })
  flushPara()
  if (cur) notes.push(cur)

  // 4b. Within a note, re-join a sentence a page break split mid-clause: a
  //     paragraph ending without terminal punctuation, followed by one starting
  //     lowercase, is one sentence ("…composed of" + "the first, sixth…").
  for (const n of notes) {
    const joined: string[] = []
    for (const p of n.paras.filter((p) => p.length > 0)) {
      const prev = joined[joined.length - 1]
      if (prev && /[a-z,]$/.test(prev) && /^[a-z]/.test(p)) {
        joined[joined.length - 1] = `${prev} ${p}`
      } else {
        joined.push(p)
      }
    }
    n.paras = joined
  }

  // Verse-note numbers only ever increase. A detected key ≤ the previous kept
  // label is a sub-enumeration ("1. … 2. …" inside a note) or a stray number
  // (an OCR-mangled marker elsewhere), not a new verse-note — demote it to
  // prose so it merges into the preceding note rather than resetting the count.
  let lastNum = 0
  for (const n of notes) {
    if (!n.label) continue
    const num = parseInt(n.label, 10)
    if (num <= lastNum) n.label = ''
    else lastNum = num
  }

  // Note labels are verse references, and the author intentionally leaves the
  // opening paragraph(s) un-numbered — a general lead-in to the comment, not a
  // note on verse 1. So we do NOT invent a "1"; an un-numbered opening renders
  // flush-left as a preamble, and the verse-keyed numbers start where the book
  // starts them (2, 4, …).
  const notes2 = notes.filter((n) => n.paras.length > 0)

  return notes2
    .map((n) => {
      const body = n.paras.join('\n\n')
      return n.label ? `${n.label}.\n${body}` : body
    })
    .join('\n\n')
}

const regions = commentRegions()
const comments = new Map<string, string>()
for (const [letter, lines] of regions) {
  comments.set(letter, cleanRegion(lines))
}

// Splice into the EN meditation file: append a `### Comment` block to each
// chapter whose (upper-cased) title has a comment. Idempotent — remove any
// existing `### Comment` … up-to-next-`## ` first.
let text = readFileSync(EN, 'utf8')
text = text.replace(/\n### Comment\n[\s\S]*?(?=\n## |\s*$)/g, '\n')

const CHAPTER_SPLIT = /(^## .+$)/m
const parts = text.split(CHAPTER_SPLIT)
let out = parts[0]
let inserted = 0
for (let i = 1; i < parts.length; i += 2) {
  const heading = parts[i] // "## Aleph"
  let body = parts[i + 1] ?? ''
  const title = heading.replace(/^##\s+/, '').trim().toUpperCase()
  const comment = comments.get(title)
  if (comment) {
    body = body.replace(/\s*$/, '\n') + `\n### Comment\n\n${comment}\n`
    inserted++
  }
  out += heading + body
}

writeFileSync(EN, out)
writeFileSync(DE, out) // German is an English placeholder until translated
console.log(
  `Inserted ${inserted} comment sections (of ${comments.size} found in OCR).`,
)
console.log(`Letters with comments: ${[...comments.keys()].sort().join(', ')}`)
