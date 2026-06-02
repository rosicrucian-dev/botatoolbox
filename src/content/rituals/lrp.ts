// Lesser Ritual of the Pentagram — parses the Markdown source.
//
// The .md file is the single source of truth: each H2 starts a section,
// each line that begins with a `<label>.` becomes a step with that label
// preserved verbatim (so what's in the file is what gets rendered). Word-
// of-power links use standard Markdown: [Display](/words-of-power/id).

import source from '@content/rituals/lrp.md?raw'

export interface InstructionRef {
  ref: string
  display: string
}

export type InstructionSegment = string | InstructionRef
export type Instruction = ReadonlyArray<InstructionSegment>

export interface Line {
  label: string
  instruction: Instruction
  text: string
  wordIds: ReadonlyArray<string>
}

export interface Section {
  title: string
  lines: ReadonlyArray<Line>
}

const WORD_LINK = /\[([^\]]+)\]\(\/words-of-power\/([^)]+)\)/g

function parseSegments(body: string): Array<InstructionSegment> {
  const segments: Array<InstructionSegment> = []
  let cursor = 0
  for (const match of body.matchAll(WORD_LINK)) {
    const start = match.index ?? 0
    if (start > cursor) segments.push(body.slice(cursor, start))
    segments.push({ display: match[1], ref: match[2] })
    cursor = start + match[0].length
  }
  if (cursor < body.length) segments.push(body.slice(cursor))
  return segments
}

function makeLine(label: string, body: string): Line {
  const instruction = parseSegments(body)
  return {
    label,
    instruction,
    text: instruction
      .map((s) => (typeof s === 'string' ? s : s.display))
      .join(''),
    wordIds: instruction
      .filter((s): s is InstructionRef => typeof s !== 'string')
      .map((s) => s.ref),
  }
}

// Matches `<label>. <body>` where label is any non-whitespace, non-dot
// run — captures both Roman numerals (i, ii, xxi) and Arabic digits.
const STEP_LINE = /^([^\s.]+)\.\s+(.+)$/

function parse(md: string): Array<Section> {
  const sections: Array<Section> = []
  let current: { title: string; lines: Array<Line> } | null = null
  for (const raw of md.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('## ')) {
      current = { title: line.slice(3).trim(), lines: [] }
      sections.push(current)
      continue
    }
    const m = line.match(STEP_LINE)
    if (m && current) current.lines.push(makeLine(m[1], m[2]))
  }
  return sections
}

export const sections: ReadonlyArray<Section> = parse(source)
