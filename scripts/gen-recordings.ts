// Sync the local mlx-whisper transcription output into site content.
//
//   npm run gen:recordings
//
// Reads local/transcription-pilot/out/**/*.md (Tier-1 pipeline artifacts:
// frontmatter + pause-based paragraphs), strips the frontmatter, and writes:
//   - content/recordings/en/<slug>.md         transcript body (rendered as prose)
//   - content/data/recordings.json            manifest (validated with RecordingSchema)
//
// Grouping is the .md file's immediate parent dir under out/ (Services, or the
// Classes series folder). Audio lives off-repo on R2; audioUrl is computed here.
// The transcript .md files are the source of truth for the body — this script
// clears and rewrites content/recordings/en/ each run so the manifest ↔ file
// bijection (checked in src/content/integrity.ts) always holds.
//
// Run under the repo's script runner: node --experimental-strip-types. Reads/
// writes files directly (the @/@content path aliases don't resolve under node).

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { z } from 'zod'

import { RecordingSchema } from '../src/content/data/schemas.ts'
import { slugify } from './lib/recordings-slug.ts'

const ROOT = resolve(import.meta.dirname, '..')
const PILOT_OUT = join(ROOT, 'local/transcription-pilot/out')
const BODY_DIR = join(ROOT, 'content/recordings/en')
const MANIFEST = join(ROOT, 'content/data/recordings.json')

// Recursively collect *.md paths under a directory.
function walkMd(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walkMd(p))
    else if (ent.name.endsWith('.md')) out.push(p)
  }
  return out
}

// Split "---\n<yaml>\n---\n\n<body>" → { fm, body }. Frontmatter is the
// pipeline's own; we read a few fields and drop the block from the body.
function parse(md: string): { fm: Record<string, string>; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n+([\s\S]*)$/)
  if (!m) return { fm: {}, body: md.trim() }
  const fm: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) fm[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').trim()
  }
  return { fm, body: m[2].trim() }
}

interface Row {
  slug: string
  title: string
  catalogNumber: string
  grouping: string
  groupingSlug: string
  durationSeconds: number
  audioPath: string
}

const files = walkMd(PILOT_OUT).sort()
if (files.length === 0) {
  console.error(
    `No transcripts found in ${PILOT_OUT.replace(ROOT + '/', '')} — run the ` +
      `Tier-1 batch first (local/transcription-pilot/batch.py).`,
  )
  process.exit(1)
}

// Rewrite the body dir from scratch so removed transcripts don't linger.
rmSync(BODY_DIR, { recursive: true, force: true })
mkdirSync(BODY_DIR, { recursive: true })

const rows: Row[] = []
const seen = new Set<string>()
for (const file of files) {
  const { fm, body } = parse(readFileSync(file, 'utf8'))
  // The .md/.json FILENAMES can be truncated for dotted titles (a Python
  // Path.with_suffix quirk in batch.py: "1. Foo.mp3" → "1.md"). The JSON's
  // `slug` field holds the true audio stem — which is also what
  // stage-r2-audio.ts slugifies for the R2 object key — so derive the slug
  // from it, guaranteeing manifest audioPaths match the uploaded keys.
  const jsonPath = file.replace(/\.md$/, '.json')
  const name = existsSync(jsonPath)
    ? (JSON.parse(readFileSync(jsonPath, 'utf8')).slug as string)
    : basename(file, '.md')
  const grouping = basename(dirname(file)) // immediate parent = Services / series
  const groupingSlug = slugify(grouping)

  let slug = slugify(name)
  // Guarantee global uniqueness (body dir is flat; route slug must be unique).
  if (seen.has(slug)) {
    let n = 2
    while (seen.has(`${slug}-${n}`)) n++
    slug = `${slug}-${n}`
  }
  seen.add(slug)

  writeFileSync(join(BODY_DIR, `${slug}.md`), body + '\n')
  rows.push({
    slug,
    title: fm.title || name,
    catalogNumber: fm.catalogNumber || '',
    grouping,
    groupingSlug,
    durationSeconds: Number(fm.durationSeconds) || 0,
    audioPath: `${groupingSlug}/${slug}.mp3`,
  })
}

// Stable order: by grouping (first-seen), then catalog number, then title.
const groupOrder = new Map<string, number>()
for (const r of rows) if (!groupOrder.has(r.grouping)) groupOrder.set(r.grouping, groupOrder.size)
rows.sort(
  (a, b) =>
    groupOrder.get(a.grouping)! - groupOrder.get(b.grouping)! ||
    a.catalogNumber.localeCompare(b.catalogNumber, undefined, { numeric: true }) ||
    // Numeric-aware so "… Class 2" precedes "… Class 10" (the class ordinal
    // lives in the title; there's no separate track number in the source).
    a.title.localeCompare(b.title, undefined, { numeric: true }),
)

z.array(RecordingSchema).parse(rows)
mkdirSync(dirname(MANIFEST), { recursive: true })
writeFileSync(MANIFEST, JSON.stringify(rows, null, 2) + '\n')

const groups = [...groupOrder.keys()]
console.log(
  `Wrote ${rows.length} recordings across ${groups.length} grouping(s) → ` +
    `${MANIFEST.replace(ROOT + '/', '')}\n` +
    `  bodies → content/recordings/en/*.md\n` +
    `  groupings: ${groups.join(', ')}`,
)
