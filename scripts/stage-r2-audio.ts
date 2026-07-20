// Stage the Ann Davies audio for R2 upload.
//
//   node --experimental-strip-types scripts/stage-r2-audio.ts
//
// Builds a SYMLINK tree at local/r2-upload/recordings/<group>/<slug>.mp3
// pointing at the source MP3s, using the SAME slug logic as gen-recordings so
// the object keys exactly match the audioPaths the transcript pages request.
// Symlinks (not copies) → no 14 GB duplication; rclone --copy-links follows
// them and uploads the real bytes. Then:
//
//   rclone copy --copy-links --transfers 16 --progress \
//     local/r2-upload/recordings  r2:<bucket>/recordings
//
// Object key recordings/<group>/<slug>.mp3 + the bucket's custom domain
// cdn.botatoolbox.org gives https://cdn.botatoolbox.org/recordings/<group>/<slug>.mp3,
// which is exactly recordingAudioUrl(audioPath) in production.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

import { slugify } from './lib/recordings-slug.ts'

// The source archive (iCloud). Override with RECORDINGS_SRC if it moves.
const SRC =
  process.env.RECORDINGS_SRC ??
  '/Users/espositocode/Library/Mobile Documents/com~apple~CloudDocs/Research/Builders of the Adytum/Historical/Recordings'
const ROOT = resolve(import.meta.dirname, '..')
const STAGE = join(ROOT, 'local/r2-upload/recordings')

function walkMp3(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '_duplicates_removed') continue
    const p = join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walkMp3(p))
    else if (ent.name.toLowerCase().endsWith('.mp3')) out.push(p)
  }
  return out
}

const files = [join(SRC, 'Services'), join(SRC, 'Classes')]
  .flatMap(walkMp3)
  .sort()

if (files.length === 0) {
  console.error(`No .mp3 files found under ${SRC}`)
  process.exit(1)
}

rmSync(join(ROOT, 'local/r2-upload'), { recursive: true, force: true })

const seen = new Set<string>()
let bytes = 0
const groups = new Map<string, number>()
for (const file of files) {
  const grouping = basename(dirname(file)) // Services, or the Classes series
  const groupSlug = slugify(grouping)
  // Match gen-recordings: it slugifies the .md basename, which is the audio
  // filename with only the trailing .mp3 removed (a ".Wav" stays in the name).
  let slug = slugify(basename(file).replace(/\.mp3$/i, ''))
  if (seen.has(slug)) {
    let n = 2
    while (seen.has(`${slug}-${n}`)) n++
    slug = `${slug}-${n}`
  }
  seen.add(slug)

  const destDir = join(STAGE, groupSlug)
  mkdirSync(destDir, { recursive: true })
  symlinkSync(file, join(destDir, `${slug}.mp3`))
  bytes += statSync(file).size
  groups.set(grouping, (groups.get(grouping) ?? 0) + 1)
}

console.log(
  `Staged ${files.length} files (${(bytes / 1e9).toFixed(2)} GB) → ` +
    `${STAGE.replace(ROOT + '/', '')}/<group>/<slug>.mp3`,
)
for (const [g, n] of groups) console.log(`  ${n.toString().padStart(3)}  ${g}`)
console.log(
  `\nNext: rclone copy --copy-links --transfers 16 --progress ` +
    `${STAGE.replace(ROOT + '/', '')}  r2:<bucket>/recordings`,
)
