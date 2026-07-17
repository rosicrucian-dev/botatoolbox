// Rituals manifest + markdown parser. The markdown bodies live in
// content/rituals/*.md; this lists them and parses their structure. The
// generic /rituals/[slug] route reads the matching .md at build. See
// README.md.
//
// The .md file is the single source of truth: each H2 starts a section,
// each line that begins with a `<label>.` becomes a step with that label
// preserved verbatim (so what's in the file is what gets rendered). Word-
// of-power links use standard Markdown: [Display](/words-of-power/id).
//
// This module is intentionally fs-free (safe to reach client components);
// server call sites read the .md from disk and hand it to parseRitual().

import { z } from 'zod'

import ritualsData from '@content/data/rituals.json'

import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { RitualSchema } from './schemas'

export type Ritual = z.infer<typeof RitualSchema>

// German titles/descriptions come from `de/rituals.json` (bodies from
// content/rituals/de/*.md) via getRituals(locale); the top-level
// exports stay pinned to English.
const rawFor = localizedRaw('rituals', ritualsData)

export const getRituals = defineLocalized((locale) => {
  const rituals: ReadonlyArray<Ritual> = z
    .array(RitualSchema)
    .parse(rawFor(locale))

  const ritualBySlug = byKey(rituals, 'slug', 'ritual.slug')

  // Rituals shown in nav / home TOC / sitemap (everything not flagged hidden).
  const visibleRituals: ReadonlyArray<Ritual> = rituals.filter((r) => !r.hidden)

  return { rituals, ritualBySlug, visibleRituals }
})

export interface InstructionRef {
  ref: string
  display: string
}

export type InstructionSegment = string | InstructionRef
export type Instruction = ReadonlyArray<InstructionSegment>

export interface RitualLine {
  label: string
  instruction: Instruction
  text: string
  wordIds: ReadonlyArray<string>
}

export interface RitualSection {
  title: string
  lines: ReadonlyArray<RitualLine>
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

function makeLine(label: string, body: string): RitualLine {
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

export function parseRitual(md: string): Array<RitualSection> {
  const sections: Array<RitualSection> = []
  let current: { title: string; lines: Array<RitualLine> } | null = null
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
