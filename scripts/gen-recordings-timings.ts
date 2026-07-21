// Build content/data/recordings-timings.json — a { slug: [startSec, …] } map
// giving each published transcript paragraph its audio start time, so the
// transcript UI can make paragraphs clickable (seek the player to that spot).
//
//   npm run gen:recordings:timings              # all recordings with a source .json
//   npm run gen:recordings:timings <slug>       # just one
//
// AUTHORITATIVE, not reconstructed. The published .md is a deterministic
// function of the immutable Whisper .json: batch.py normalizes each segment's
// text (glossary find/replace, which never touches timing) and groups WHOLE
// segments into paragraphs by pause. We replicate that exact grouping here over
// the .json's segments, so each paragraph's start is simply its first segment's
// start — no fuzzy text alignment. As a proof, we require the derived paragraphs
// to equal the published .md paragraphs; a recording that doesn't match (hand-
// edited, or Tier-2 re-paragraphed after publish) is REPORTED, never shipped
// with guessed timings.
//
// Keep the grouping constants / normalize map in sync with
// local/transcription-pilot/{batch.py,glossary.json}; the equality check makes
// any drift self-detecting (a drifted recording flags instead of misaligning).
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { slugify } from './lib/recordings-slug.ts'

const ROOT = resolve(import.meta.dirname, '..')
const PILOT = join(ROOT, 'local/transcription-pilot')
const PILOT_OUT = join(PILOT, 'out')
const BODY_DIR = join(ROOT, 'content/recordings/en')
const OUT = join(ROOT, 'content/data/recordings-timings.json')

// ---- batch.py grouping, ported faithfully -------------------------------
const GAP_S = 0.8
const MAX_WORDS = 160

interface Segment {
  start: number
  end: number
  text: string
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const NORM: Record<string, string> = JSON.parse(
  readFileSync(join(PILOT, 'glossary.json'), 'utf8'),
).normalize
// Whole-word, case-insensitive, longest alternative first (matches batch.py).
const NORM_RE = new RegExp(
  '\\b(' +
    Object.keys(NORM)
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|') +
    ')\\b',
  'gi',
)
function normalize(text: string): string {
  return text.replace(NORM_RE, (m) => {
    const tgt = NORM[m.toLowerCase()]
    return /[A-Z]/.test(m[0]) ? tgt[0].toUpperCase() + tgt.slice(1) : tgt
  })
}

const endsSentence = (t: string) => /[.!?]["')]?$/.test(t.trim())
const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length

/** Group whole (normalized) segments into paragraphs, keeping each one's start. */
function paragraphs(segs: Segment[]): Array<{ start: number; text: string }> {
  const out: Array<{ start: number; text: string }> = []
  let cur: string[] = []
  let words = 0
  let start = 0
  for (let i = 0; i < segs.length; i++) {
    const t = normalize(segs[i].text).trim()
    if (!t) continue
    if (cur.length === 0) start = segs[i].start
    cur.push(t)
    words += wordCount(t)
    const gap = i + 1 < segs.length ? segs[i + 1].start - segs[i].end : 999
    if (
      (gap >= GAP_S && endsSentence(t)) ||
      (words >= MAX_WORDS && endsSentence(t)) ||
      i + 1 === segs.length
    ) {
      out.push({ start, text: cur.join(' ') })
      cur = []
      words = 0
    }
  }
  if (cur.length) out.push({ start, text: cur.join(' ') })
  return out
}

// ---- drive it -----------------------------------------------------------
function walkJson(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walkJson(p))
    else if (ent.name.endsWith('.json')) out.push(p)
  }
  return out
}

// slug → segments, assigning slugs EXACTLY as gen-recordings.ts does: sorted
// source order, with a "-N" suffix on duplicate titles (the archive has a few
// talks in two groupings). Replicating that here is what makes each published
// body match the right .json — otherwise duplicates collide and falsely flag.
const segsBySlug = new Map<string, Segment[]>()
const taken = new Set<string>()
for (const file of walkJson(PILOT_OUT).sort()) {
  const d = JSON.parse(readFileSync(file, 'utf8')) as {
    slug?: string
    segments?: Segment[]
  }
  let slug = slugify(d.slug ?? '')
  if (!slug) continue
  if (taken.has(slug)) {
    let n = 2
    while (taken.has(`${slug}-${n}`)) n++
    slug = `${slug}-${n}`
  }
  taken.add(slug)
  if (Array.isArray(d.segments)) segsBySlug.set(slug, d.segments)
}

// Cosmetic-whitespace-insensitive comparison; still catches any word or
// paragraph-boundary difference (which is what we care about).
const canon = (s: string) => s.replace(/\s+/g, ' ').trim()

const only = process.argv[2]
const slugs = readdirSync(BODY_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''))
  .filter((slug) => !only || slug === only)

const timings: Record<string, number[]> = {}
const noSource: string[] = []
const mismatched: string[] = []
for (const slug of slugs) {
  const segs = segsBySlug.get(slug)
  if (!segs) {
    noSource.push(slug)
    continue
  }
  const derived = paragraphs(segs)
  const published = readFileSync(join(BODY_DIR, `${slug}.md`), 'utf8')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const matches =
    derived.length === published.length &&
    derived.every((d, i) => canon(d.text) === canon(published[i]))

  if (matches) {
    timings[slug] = derived.map((d) => Math.max(0, Math.round(d.start * 100) / 100))
  } else {
    mismatched.push(slug)
  }
}

// Merge so a single-slug run doesn't drop the rest; drop any slug we just
// re-evaluated as a mismatch so stale (guessed) timings can't linger.
const existing: Record<string, number[]> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf8'))
  : {}
for (const slug of mismatched) delete existing[slug]
writeFileSync(OUT, JSON.stringify({ ...existing, ...timings }) + '\n')

console.log(
  `Timings: ${Object.keys(timings).length} verified${only ? ` (filter: ${only})` : ''} → ` +
    OUT.replace(ROOT + '/', ''),
)
if (mismatched.length) {
  console.log(
    `  ⚠ ${mismatched.length} did NOT match the published .md (edited/re-paragraphed after publish) — no timings emitted:`,
  )
  for (const s of mismatched.slice(0, 20)) console.log(`      ${s}`)
  if (mismatched.length > 20) console.log(`      … +${mismatched.length - 20} more`)
}
if (noSource.length) {
  console.log(`  ${noSource.length} had no source .json (skipped)`)
}
