// Bucket-A transcript cleanup: apply deterministic glossary + sentence-case
// fixes to content/recordings/en/*.md, preserving paragraph structure (so the
// per-paragraph timings stay valid).
//
//   npm run fix:transcripts            # DRY RUN — reports scope + sample diffs
//   npm run fix:transcripts -- --write # apply the changes
//   npm run fix:transcripts -- --write <slug>   # just one file
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { buildNormalize, capitalize } from './lib/transcript-normalize.ts'

const ROOT = resolve(import.meta.dirname, '..')
const BODY_DIR = join(ROOT, 'content/recordings/en')
const GLOSSARY = join(ROOT, 'local/transcription-pilot/glossary.json')

const normalize = buildNormalize(
  JSON.parse(readFileSync(GLOSSARY, 'utf8')).normalize as Record<string, string>,
)

const write = process.argv.includes('--write')
const onlySlug = process.argv.slice(2).find((a) => !a.startsWith('--'))

const paras = (md: string) =>
  md
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

const snippet = (s: string, i: number, w = 24) =>
  (i > w ? '…' : '') +
  s.slice(Math.max(0, i - w), i) +
  '⟦' +
  s[i] +
  '⟧' +
  s.slice(i + 1, i + w) +
  (i + w < s.length ? '…' : '')

let filesChanged = 0
let parasChanged = 0
let capFixes = 0
const glossaryHits: string[] = []
const capSamples: string[] = []

const files = readdirSync(BODY_DIR)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !onlySlug || f === `${onlySlug}.md`)

for (const file of files) {
  const original = readFileSync(join(BODY_DIR, file), 'utf8')
  const out = paras(original).map((p) => {
    const norm = normalize(p) // glossary
    const capd = capitalize(norm) // sentence-case
    if (norm !== p) {
      parasChanged++
      // find the glossary change region for the report
      for (let i = 0; i < Math.min(norm.length, p.length); i++) {
        if (norm[i] !== p[i]) {
          glossaryHits.push(`${file.replace(/\.md$/, '')}: …${p.slice(Math.max(0, i - 20), i + 12)}… → …${norm.slice(Math.max(0, i - 20), i + 10)}…`)
          break
        }
      }
    }
    // cap changes: norm→capd is case-only, same length
    for (let i = 0; i < capd.length; i++) {
      if (capd[i] !== norm[i]) {
        capFixes++
        if (norm !== p) continue // already counted this para above
        if (capSamples.length < 16) capSamples.push(snippet(norm, i))
      }
    }
    if (capd !== p && norm === p) parasChanged++
    return capd
  })
  const fixed = out.join('\n\n') + '\n'
  if (fixed !== original) {
    filesChanged++
    if (write) writeFileSync(join(BODY_DIR, file), fixed)
  }
}

console.log(
  `${write ? 'WROTE' : 'DRY RUN'} — ${filesChanged}/${files.length} files would change, ` +
    `~${parasChanged} paragraphs, ${capFixes} capitalization fixes, ${glossaryHits.length} glossary/term fixes.`,
)
if (glossaryHits.length) {
  console.log(`\n── glossary / term fixes (${glossaryHits.length}) ──`)
  for (const h of glossaryHits.slice(0, 15)) console.log('  ' + h)
  if (glossaryHits.length > 15) console.log(`  … +${glossaryHits.length - 15} more`)
}
if (capSamples.length) {
  console.log(`\n── capitalization fixes (sample; ⟦X⟧ = the letter capitalized) ──`)
  for (const s of capSamples) console.log('  ' + s)
}
if (!write) console.log('\nRe-run with --write to apply.')
