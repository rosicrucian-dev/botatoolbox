// The Pattern on the Trestleboard — parses the Markdown source. Each
// numbered list item becomes a statement; the line's prefix label is
// preserved verbatim so the docs page can show what the source shows.

import source from '@content/texts/pattern-trestleboard.md?raw'

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

export const statements: ReadonlyArray<Statement> = parse(source)
