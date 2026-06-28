// Build scripts/vendor/paul-case-notebook.json — "The Gematria Notebooks of
// Paul Foster Case", keyed by number. Source is the Mistral OCR under
// ocr/gematria-notebook/ (sections 1 & 2; section 3 is a noisy correction pass
// excluded here). Reference PDF: public/files/gematria-notebook.pdf.
//
//   node --experimental-strip-types scripts/build-paul-case-notebook.ts
//
// Unlike a clean dictionary, this is an ANTHOLOGY: each number is covered
// across several notebook "passes" that each run from low numbers upward, some
// with factorization headers ("6 (2*3)"), some with bare-number headers
// (Genesis word lists). We segment on those headers and hand back the verbatim
// text per number — OCR artifacts and all, since the goal is "show whatever
// Case wrote for this number", not a curated gloss.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OCR = join(ROOT, 'ocr/gematria-notebook')
const FILES = [
  join(OCR, 'gematria-notebook-1.pdf/markdown.md'),
  join(OCR, 'gematria-notebook-2.pdf/markdown.md'),
]
const OUT = join(ROOT, 'scripts/vendor/paul-case-notebook.json')

// A confident header: a number followed by a (factorization) or (prime) marker,
// optionally a markdown heading, optionally a trailing title. Unambiguous —
// in-prose numbers never wear a factorization, so these never false-trigger.
const CONFIDENT = /^#*\s*(\d{1,6})\s*\((?:prime|\d[\d\s^*+/.,()=x-]*)\)/
// A markdown heading that leads with a number, e.g. "# 0 NO-THING" or
// "## 9 The Ennead". The "# " marker is structural (not prose), so a numbered
// heading is a real section start even without a factorization. Excludes
// "#58." (no space after #) which is a numbered note, not a heading.
const MD_HEAD = /^#+\s+(\d{1,6})(?=\s|$|\()/
// A bare header: a line that is ONLY a number (optionally a markdown heading).
const BARE = /^#*\s*(\d{1,6})\s*$/

interface Cand {
  n: number
  line: number
  confident: boolean
}

// Collect candidate headers from a section's lines.
function candidates(lines: Array<string>): Array<Cand> {
  const out: Array<Cand> = []
  for (let i = 0; i < lines.length; i++) {
    const c = lines[i].match(CONFIDENT) ?? lines[i].match(MD_HEAD)
    if (c) {
      out.push({ n: +c[1], line: i, confident: true })
      continue
    }
    const b = lines[i].match(BARE)
    if (b) {
      // Require the next non-empty line to be entry-like (not a continuation of
      // wrapped prose, which starts lowercase). Cheap, effective stray filter.
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') j++
      const next = lines[j] ?? ''
      if (next && !/^[a-z]/.test(next)) {
        out.push({ n: +b[1], line: i, confident: false })
      }
    }
  }
  return out
}

// Accept candidates into segments. Numbers ascend within a notebook "pass";
// when the sequence drops far and then keeps ascending from the low point, a
// new pass has begun (the next notebook restarting). A lone low number whose
// successor jumps back up is a stray (an isolated cross-reference) and is
// dropped. This is what keeps one pass's content from swallowing the next.
const RESTART_DROP = 30
function accept(cands: Array<Cand>): Array<Cand> {
  const kept: Array<Cand> = []
  let max = 0
  for (let k = 0; k < cands.length; k++) {
    const c = cands[k]
    if (c.n > max) {
      kept.push(c)
      max = c.n
      continue
    }
    // c.n <= max: stray or restart?
    if (max - c.n > RESTART_DROP) {
      // Restart if this begins a new ascending run: a confident header is a
      // strong signal on its own; for a bare header, confirm the next kept-able
      // candidate continues upward from here rather than snapping back to max.
      const nxt = cands[k + 1]
      const ascendsFromHere = nxt && nxt.n > c.n && nxt.n < max
      if (c.confident || ascendsFromHere) {
        kept.push(c)
        max = c.n
      }
    }
    // else: a small backward step — a stray; drop it.
  }
  return kept
}

// Tidy a verbatim block for display without altering meaning: de-escape the
// markdown the OCR introduced, strip heading markers, normalize blank runs.
function clean(s: string): string {
  return s
    .replace(/\\([*_[\]()#~`>+.\-])/g, '$1') // de-escape markdown
    .split('\n')
    .map((l) => l.replace(/^#+\s*/, '').replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const byNumber = new Map<number, Array<string>>()
let totalSegments = 0
for (const file of FILES) {
  const lines = readFileSync(file, 'utf8').replace(/\\\*/g, '*').split(/\r?\n/)
  const heads = accept(candidates(lines))
  totalSegments += heads.length
  for (let k = 0; k < heads.length; k++) {
    const start = heads[k].line
    const end = k + 1 < heads.length ? heads[k + 1].line : lines.length
    const text = clean(lines.slice(start, end).join('\n'))
    if (!text) continue
    const arr = byNumber.get(heads[k].n) ?? []
    arr.push(text)
    byNumber.set(heads[k].n, arr)
  }
}

// One block per number: distinct passes joined by a divider, exact repeats
// dropped (the same notebook content sometimes appears twice).
const out: Record<string, string> = {}
for (const n of [...byNumber.keys()].sort((a, b) => a - b)) {
  const passes = [...new Set(byNumber.get(n)!)]
  out[String(n)] = passes.join('\n\n———\n\n')
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

const nums = Object.keys(out).map(Number)
const sizes = nums
  .map((n) => out[String(n)].length)
  .sort((a, b) => b - a)
console.log(
  `Wrote ${nums.length} numbered entries (${totalSegments} segments) → ${OUT.replace(ROOT + '/', '')}`,
)
console.log(`  range ${Math.min(...nums)}–${Math.max(...nums)}`)
console.log(
  `  block chars: median ${sizes[Math.floor(sizes.length / 2)]}, biggest ${sizes.slice(0, 5).join(', ')}`,
)
console.log(`  blocks >30k chars: ${sizes.filter((s) => s > 30000).length}`)
