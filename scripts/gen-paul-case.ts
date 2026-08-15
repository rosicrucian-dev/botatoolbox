// Build scripts/vendor/paul-case.json — Paul Case's "A Brief Qabalistic
// Dictionary" (from Occult Fundamentals and Spiritual Unfoldment), keyed by
// number. Source is the Mistral OCR under ocr/. The dictionary is number-keyed
// already; we just need to split the text into <number> → <full entry text>.
//
//   node --experimental-strip-types scripts/gen-paul-case.ts
//
// The committed JSON is the source of truth (the ocr/ dir is a one-time OCR
// artifact). Re-run only to regenerate from updated OCR; hand-fixes to the JSON
// are fine and expected (a few OCR typos in the glosses).

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OCR = join(ROOT, 'ocr')
const OUT = join(ROOT, 'scripts/vendor/paul-case.json')

// Maintainer-only: the OCR scans are private and gitignored. For everyone
// else the committed scripts/vendor/paul-case.json IS the source of truth.
if (!existsSync(OCR)) {
  console.log(
    "gen-paul-case: requires the maintainer's private OCR scans (ocr/ is\n" +
      'gitignored). The committed scripts/vendor/paul-case.json is the source\n' +
      'of truth for contributors — nothing to do.',
  )
  process.exit(0)
}

// Read each fragment's markdown, order by the page number printed at its end
// (119–126) — filename order is unreliable (the base file sorts after " 2").
const docs = readdirSync(OCR)
  .filter((d) => d.endsWith('.pdf'))
  .map((d) => {
    const md = readFileSync(join(OCR, d, 'markdown.md'), 'utf8')
    const page = Number(md.trim().match(/(\d{3})\s*$/)?.[1] ?? 9999)
    return { page, md }
  })
  .sort((a, b) => a.page - b.page)

let text = docs.map((x) => x.md).join('\n')

// Drop the title/preamble (everything before the first entry "3.") and the
// trailing page-number lines (119–126).
text = text.slice(text.search(/(^|\n)\s*3\.\s/))
text = text.replace(/^\s*(119|12[0-6])\s*$/gm, '')

// Candidate entry boundaries: a number followed by "." then text, anywhere
// (handles entries merged onto one line, e.g. "…longed for. 414. AZVTh…").
// Plus two known OCR oddities: "81 A number…" (no period) and "496.5:1…" (the
// "S" of "S:1" OCR'd as "5", swallowing the period-space).
type Bound = { num: number; start: number; textStart: number }
const bounds: Array<Bound> = []
const push = (num: number, start: number, textStart: number) =>
  bounds.push({ num, start, textStart })

for (const m of text.matchAll(/(?:^|\s)(\d{1,4})\.\s+(?=\S)/g)) {
  push(Number(m[1]), m.index, m.index + m[0].length)
}
for (const m of text.matchAll(/(?:^|\s)(81)\s+(?=A number)/g)) {
  push(81, m.index, m.index + m[0].length)
}
for (const m of text.matchAll(/(?:^|\s)(496)\.(?=\d)/g)) {
  push(496, m.index, m.index + m[0].length - 1) // keep the "5:1…" as text
}

bounds.sort((a, b) => a.start - b.start)

// Accept a boundary only if its number is greater than the last accepted one —
// this rejects in-prose numbers ("3 and 4.", "=26.", page refs) as text.
const accepted: Array<Bound> = []
let max = 0
for (const b of bounds) {
  if (b.num > max) {
    accepted.push(b)
    max = b.num
  }
}

const clean = (s: string) =>
  s
    .replace(/^\s*(119|12[0-6])\s*$/gm, '') // any stray page numbers
    .replace(/\s+/g, ' ')
    .trim()

const out: Record<string, string> = {}
for (let i = 0; i < accepted.length; i++) {
  const b = accepted[i]
  const end = i + 1 < accepted.length ? accepted[i + 1].start : text.length
  let body = text.slice(b.textStart, end)
  // The final entry (1081) runs into the dictionary's closing prose — cut it.
  body = body.replace(/\bIn the foregoing pages\b[\s\S]*$/, '')
  out[String(b.num)] = clean(body)
}

// Targeted OCR repairs (the structure is clean; these are a few obvious glitches
// the OCR introduced). The "~" stood in for a dropped letter.
if (out['496']) out['496'] = out['496'].replace(/^\.?5:1/, 'S:1')
const TYPO_FIX: Array<[RegExp, string]> = [
  [/second ~etter/g, 'second letter'],
  [/fourfold m~nifestation/g, 'fourfold manifestation'],
  [/12 boundrie lines/g, '12 boundary lines'],
  [/AISh MLChN4H/g, 'AISh MLChMH'],
  [/L\)LTh, name of the 4th/g, 'DLTh, name of the 4th'],
]
for (const k of Object.keys(out)) {
  for (const [re, to] of TYPO_FIX) out[k] = out[k].replace(re, to)
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

const nums = accepted.map((b) => b.num)
console.log(
  `Wrote ${nums.length} numbered entries → ${OUT.replace(ROOT + '/', '')}`,
)
console.log('numbers:', nums.join(' '))
// Sanity: report any non-increasing (should be none) and longest/shortest.
const lens = Object.entries(out).map(([n, t]) => [n, t.length] as const)
lens.sort((a, b) => a[1] - b[1])
console.log(
  'shortest:',
  lens
    .slice(0, 3)
    .map(([n, l]) => `${n}(${l})`)
    .join(' '),
)
console.log(
  'longest:',
  lens
    .slice(-3)
    .map(([n, l]) => `${n}(${l})`)
    .join(' '),
)
