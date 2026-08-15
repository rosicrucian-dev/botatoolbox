import { execFileSync } from 'node:child_process'
import { readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { MAJOR_STYLES, MINOR_STYLES } from '../src/content/data/tarot-styles.ts'

// Regenerates the downloadable tarot image ZIPs under local/files (the
// gitignored staging area for `downloads` release assets), one per
// art style, driven by the style registry. Adding a style there (and its
// images under public/tarot) makes it ship as a download with no edits here.
//
// Majors zip the full-res art only — the thumbs/ subdir is for on-site
// rendering, not downloads. `zip -j` flattens paths and we pass an explicit
// file list, so the thumbs/ subdir is naturally excluded. Run after
// `npm run optimize:tarot`.

const ROOT = resolve(import.meta.dirname, '..')
const FILES = join(ROOT, 'local', 'files')

function zipStyleDir(dir: string, outName: string) {
  const jpgs = readdirSync(dir)
    .filter((f) => f.endsWith('.jpg'))
    .map((f) => join(dir, f))
  if (jpgs.length === 0) {
    console.warn(`skipped ${outName} — no .jpg files in ${dir}`)
    return
  }
  const out = join(FILES, outName)
  rmSync(out, { force: true })
  execFileSync('zip', ['-q', '-j', '-X', out, ...jpgs])
  console.log(`wrote ${outName} (${jpgs.length} images)`)
}

for (const style of MAJOR_STYLES) {
  zipStyleDir(
    join(ROOT, 'public', 'tarot', 'major', style.id),
    `Major Arcana Images - ${style.label}.zip`,
  )
}

for (const style of MINOR_STYLES) {
  zipStyleDir(
    join(ROOT, 'public', 'tarot', 'minor', style.id),
    `Minor Arcana Images - ${style.label}.zip`,
  )
}
