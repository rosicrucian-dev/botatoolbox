// Build `public/data/gematria-words.json` — a value-indexed gematria dictionary
// listed BY SOURCE (nothing merged across sources), from the vendored sources.
//
//   npm run gen:gematria-words
//
// For every Hebrew word we recompute the gematria with THIS app's scheme
// (standard absolute value; sofit/final letters inherit their base value) and
// re-bucket by that value, rather than trusting a source's own numbering.
//
// Each gematria number collects, independently:
//   - notes  — number-keyed prose (Paul Case's dictionaries), per source id.
//   - words  — word lists, per source id: Crowley (one curated gloss each) and
//              Strong's (every Biblical spelling at the value, all its senses).
// There is no cross-source matching — each source's words stand on their own.
//
// Run with the repo's script runner: node --experimental-strip-types. It reads/
// writes JSON directly (the @/@content path aliases don't resolve under node).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { GematriaWordsSchema } from '../src/content/data/schemas.ts'
import {
  GEMATRIA_SOURCES,
  type GematriaSourceId,
} from '../src/content/data/gematria-sources.ts'
import {
  LETTER_VALUE,
  ROMAN_TO_BASE_GLYPH,
  gematriaValue,
} from '../src/lib/hebrew-letters.ts'

const ROOT = resolve(import.meta.dirname, '..')
const SRC = join(ROOT, 'scripts/vendor/sepher-sephiroth.source.json')
const STRONGS = join(ROOT, 'scripts/vendor/strongs-hebrew.source.json')
// Number-keyed 'note' sources: source id → vendored JSON ({ number → text }).
// Files may be absent (a source still being extracted) — treated as empty.
const NOTE_FILES: Record<string, string> = {
  'case-fundamentals': join(ROOT, 'scripts/vendor/paul-case.json'),
}
// Shipped as a STATIC FILE (not a bundled import): it's large — every value's
// Crowley plus the full Hebrew Bible — so the app fetches it on demand instead
// of inlining it into the gematria pages' JS. Hence /public, served at /data/….
const OUT = join(ROOT, 'public/data/gematria-words.json')

interface SourceWord {
  word?: string
  hebrew?: string
  gematria?: number
  desc?: string
}
interface SourceEntry {
  number: number
  desc?: string
  words?: Array<SourceWord>
}

interface OutWord {
  hebrew: string
  text: string
  ref?: string
}
interface OutEntry {
  significance?: string
  notes?: Record<string, string>
  words?: Record<string, Array<OutWord>>
}

// Keep only Hebrew letters + single spaces (drops niqqud, abbreviation colons,
// stray Latin/punctuation). Collapses runs of whitespace.
function cleanHebrew(raw: string): string {
  return Array.from(raw)
    .map((ch) => (LETTER_VALUE[ch] ? ch : /\s/.test(ch) ? ' ' : ''))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function clean(s: string | undefined): string {
  return (s ?? '')
    .replace(
      /HB:(Ch|Sh|Th|Tz|[A-Z])/g,
      (_, code) => ROMAN_TO_BASE_GLYPH[code] ?? '',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

// value → that value's content, assembled below.
const entries = new Map<number, OutEntry>()
function entryFor(value: number): OutEntry {
  let e = entries.get(value)
  if (!e) {
    e = {}
    entries.set(value, e)
  }
  return e
}
function setWords(value: number, id: GematriaSourceId, words: Array<OutWord>) {
  if (!words.length) return
  const e = entryFor(value)
  ;(e.words ??= {})[id] = words
}
function setNote(value: number, id: GematriaSourceId, text: string) {
  if (!text) return
  const e = entryFor(value)
  ;(e.notes ??= {})[id] = text
}

// ── Number-keyed 'note' sources (Paul Case) ────────────────────────────────
// Note text is already clean from its own build script (gen-paul-case.ts)
// and may contain paragraph breaks we must preserve — so it is NOT run through
// clean() (which collapses whitespace).
let noteCount = 0
for (const src of GEMATRIA_SOURCES) {
  if (src.kind !== 'note') continue
  const file = NOTE_FILES[src.id]
  let data: Record<string, string> = {}
  try {
    data = JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    // Source not yet extracted — leave it empty; it drops in when the file
    // appears, no other change needed.
    continue
  }
  for (const [num, text] of Object.entries(data)) {
    const value = Number(num)
    const t = (text ?? '').trim()
    if (!(Number.isInteger(value) && value > 0 && t)) continue
    setNote(value, src.id, t)
    noteCount++
  }
}

// ── Crowley (Sepher Sephiroth): one curated gloss per word ─────────────────
const source: Array<SourceEntry> = JSON.parse(readFileSync(SRC, 'utf8'))

// Per-number significance note, keyed by the bucket number, independent of
// which words land there. Some are prose ("The Mystic Number of Chokmah"),
// some are bare planetary symbols — "♂" on 5 (Geburah/Mars), "☽." on 3321
// (the Moon kamea's total) — which look like OCR junk but are genuine
// Sepher Sephiroth annotations. Don't filter them.
for (const e of source) {
  const note = clean(e.desc)
  if (note) entryFor(e.number).significance = note
}

const crowleyByValue = new Map<number, Array<OutWord>>()
const crowleySeen = new Map<number, Set<string>>()
let crowleyWords = 0
let skipped = 0
for (const entry of source) {
  for (const w of entry.words ?? []) {
    const hebrew = cleanHebrew(w.hebrew ?? '')
    if (!hebrew) {
      skipped++
      continue
    }
    const value = gematriaValue(hebrew)
    if (value <= 0) {
      skipped++
      continue
    }
    const gloss = clean(w.desc)
    // De-dupe identical (spelling + gloss) within a bucket; homonyms with
    // different glosses are kept as separate rows.
    const key = `${hebrew} ${gloss}`
    const seen = crowleySeen.get(value) ?? new Set<string>()
    if (seen.has(key)) continue
    seen.add(key)
    crowleySeen.set(value, seen)
    const list = crowleyByValue.get(value) ?? []
    // A bare citation with no gloss still earns a row (the word itself counts);
    // `text` carries the gloss when present.
    list.push({ hebrew, text: gloss })
    crowleyByValue.set(value, list)
    crowleyWords++
  }
}
for (const [value, words] of crowleyByValue) setWords(value, 'crowley', words)

// ── Strong's: one row per entry, bucketed by value ─────────────────────────
// Each Strong's number is its own word (its pointed lemma is a real,
// vocalized spelling). Homographs share a gematria value and so land in the
// same number, each as its own row — the tool surfaces every possibility
// rather than collapsing them under a consonantal skeleton.
interface StrongsEntry {
  lemma?: string
  strongs_def?: string
}
const strongsDict: Record<string, StrongsEntry> = JSON.parse(
  readFileSync(STRONGS, 'utf8'),
)
const strongsByValue = new Map<number, Array<OutWord>>()
const strongsSeen = new Map<number, Set<string>>()
let strongsWords = 0
for (const num of Object.keys(strongsDict)) {
  // Keep the lemma's niqqud — the pointed form is what we display. The value
  // comes from its consonants (gematriaValue ignores vowel points).
  const lemma = (strongsDict[num].lemma ?? '').trim()
  const value = gematriaValue(lemma)
  if (value <= 0) continue
  // `{...}` braces mark a borrowed definition in Strong's; strip them.
  const def = clean((strongsDict[num].strongs_def ?? '').replace(/[{}]/g, ''))
  if (!def) continue
  // De-dupe exact (spelling + gloss) repeats; distinct lemmas or meanings stay.
  const key = `${lemma} ${def.toLowerCase()}`
  const seen = strongsSeen.get(value) ?? new Set<string>()
  if (seen.has(key)) continue
  seen.add(key)
  strongsSeen.set(value, seen)
  const list = strongsByValue.get(value) ?? []
  list.push({ hebrew: lemma, text: def, ref: num })
  strongsByValue.set(value, list)
  strongsWords++
}
// Order each value's rows by Strong's number — stable and traceable.
const refNum = (w: OutWord) => Number((w.ref ?? 'H0').slice(1))
for (const [value, words] of strongsByValue) {
  words.sort((a, b) => refNum(a) - refNum(b))
  setWords(value, 'strongs', words)
}

// ── Serialize in ascending numeric order ───────────────────────────────────
const out: Record<string, OutEntry> = {}
for (const value of [...entries.keys()].sort((a, b) => a - b)) {
  const e = entries.get(value)!
  out[value] = {
    ...(e.significance ? { significance: e.significance } : null),
    ...(e.notes ? { notes: e.notes } : null),
    ...(e.words ? { words: e.words } : null),
  }
}

// Validate the output against the same schema the app types itself from, so a
// malformed build fails here rather than shipping bad data.
GematriaWordsSchema.parse(out)

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

console.log(
  `Wrote ${Object.keys(out).length} numbers → ${OUT.replace(ROOT + '/', '')}\n` +
    `  Notes (Paul Case): ${noteCount} entries across ${
      GEMATRIA_SOURCES.filter((s) => s.kind === 'note').length
    } sources\n` +
    `  Crowley: ${crowleyWords} words\n` +
    `  Strong's: ${strongsWords} words across ${strongsByValue.size} values\n` +
    `  skipped ${skipped} Crowley source words with no usable Hebrew`,
)
