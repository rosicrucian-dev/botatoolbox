import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'

// Re-encodes the tarot card originals into compressed JPEGs + smaller
// thumbnail variants for the public asset tree. Reads from
// `tarot-originals/` (committed source-of-truth) and writes into
// `public/tarot/`. Idempotent; safe to re-run.
//
// Compression settings were picked by comparing q=70/80/85/90 on
// representative cards: q=85 was the lowest where banding disappears
// in the solid-color backgrounds. mozjpeg shaves another ~5-10% off at
// the same visual quality. Thumbnail width is half the largest
// displayed size (max-w-[280px]) for retina sharpness.

const ROOT = path.resolve(import.meta.dirname, '..')

const FULL_QUALITY = 85
const THUMB_QUALITY = 85
const THUMB_WIDTH = 362

// Higher quality for the colored set — sources are already low-res
// (270×466) and JPEG artifacts get more visible at lower resolutions
// because each compression block covers a bigger fraction of the
// image. q=92 keeps file sizes reasonable (~40-60 KB each) without
// noticeable artifacts. No upscaling; we keep the 270×466 source
// dimensions and let the browser scale them at display time.
const MINOR_COLORED_QUALITY = 92

// ---- majors --------------------------------------------------------
// The `major` originals are the "Traditional" art style. Other major styles
// (e.g. Modern) are managed outside this pipeline.
// Originals: tarot-originals/major/<num>-<slug>.jpg
// Outputs:   public/tarot/major/traditional/<num>-<slug>.jpg
//          + public/tarot/major/traditional/thumbs/<num>-<slug>.jpg
const MAJOR_SRC = path.join(ROOT, 'tarot-originals/major')
const MAJOR_OUT_FULL = path.join(ROOT, 'public/tarot/major/traditional')
const MAJOR_OUT_THUMBS = path.join(ROOT, 'public/tarot/major/traditional/thumbs')

const SUITS = ['wands', 'cups', 'swords', 'pentacles']

function minorSlugFromOriginal(filename: string): string | null {
  // Strip the extension; the rest is already a valid slug.
  return filename.replace(/\.(jpe?g|png)$/i, '')
}

async function encodeFull(
  src: string,
  dest: string,
  opts?: { maxWidth?: number; quality?: number },
) {
  const pipeline = sharp(src)
  if (opts?.maxWidth !== undefined) {
    pipeline.resize({ width: opts.maxWidth, withoutEnlargement: true })
  }
  await pipeline
    .jpeg({
      quality: opts?.quality ?? FULL_QUALITY,
      progressive: true,
      mozjpeg: true,
    })
    .toFile(dest)
}

async function encodeThumb(src: string, dest: string) {
  await sharp(src)
    .resize({ width: THUMB_WIDTH })
    .jpeg({ quality: THUMB_QUALITY, progressive: true, mozjpeg: true })
    .toFile(dest)
}

async function optimizeMajors() {
  await fs.mkdir(MAJOR_OUT_FULL, { recursive: true })
  await fs.mkdir(MAJOR_OUT_THUMBS, { recursive: true })

  const files = (await fs.readdir(MAJOR_SRC))
    .filter((f) => f.endsWith('.jpg'))
    .sort()

  console.log(`\n=== Major Arcana (${files.length} cards) ===`)
  let totalSrc = 0
  let totalFull = 0
  let totalThumb = 0

  for (const file of files) {
    const src = path.join(MAJOR_SRC, file)
    const fullDest = path.join(MAJOR_OUT_FULL, file)
    const thumbDest = path.join(MAJOR_OUT_THUMBS, file)

    await encodeFull(src, fullDest)
    await encodeThumb(src, thumbDest)

    const [srcStat, fullStat, thumbStat] = await Promise.all([
      fs.stat(src),
      fs.stat(fullDest),
      fs.stat(thumbDest),
    ])
    totalSrc += srcStat.size
    totalFull += fullStat.size
    totalThumb += thumbStat.size
    console.log(
      `${file.padEnd(38)} ${kb(srcStat.size).padStart(7)} → full ${kb(fullStat.size).padStart(7)}  thumb ${kb(thumbStat.size).padStart(6)}`,
    )
  }

  summarize('majors', totalSrc, totalFull, totalThumb)
}

function summarize(name: string, src: number, full: number, thumb: number) {
  console.log()
  console.log(`originals (${name}): ${mb(src)}`)
  console.log(`full q${FULL_QUALITY}:  ${mb(full)}  (${pct(full, src)} of originals)`)
  console.log(
    `thumbs (${THUMB_WIDTH}w q${THUMB_QUALITY}): ${mb(thumb)}  (${pct(thumb, src)} of originals)`,
  )
}

function kb(n: number) {
  return `${(n / 1024).toFixed(0)} KB`
}
function mb(n: number) {
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
function pct(n: number, d: number) {
  return `${((n / d) * 100).toFixed(0)}%`
}

// Colored minor set by Josh Yates — currently the only minor art style.
// Outputs under the style-keyed minor tree: public/tarot/minor/josh-yates/.
const MINOR_COLORED_SRC = path.join(ROOT, 'tarot-originals/minor-colored')
const MINOR_COLORED_OUT = path.join(ROOT, 'public/tarot/minor/josh-yates')

async function optimizeMinorsColored() {
  await fs.mkdir(MINOR_COLORED_OUT, { recursive: true })

  console.log('\n=== Minor Arcana — Colored ===')
  let totalSrc = 0
  let totalFull = 0
  let count = 0

  for (const suit of SUITS) {
    const suitDir = path.join(MINOR_COLORED_SRC, suit)
    let files: string[]
    try {
      files = (await fs.readdir(suitDir))
        .filter((f) => /\.(jpe?g|png)$/i.test(f))
        .sort()
    } catch {
      continue
    }

    for (const file of files) {
      const slug = minorSlugFromOriginal(file)
      if (!slug) continue

      const src = path.join(suitDir, file)
      const fullDest = path.join(MINOR_COLORED_OUT, `${slug}.jpg`)

      // No width cap, no upscale — source is already 270×466 (small)
      // and we want to preserve every pixel. Quality bumped to 92.
      await encodeFull(src, fullDest, { quality: MINOR_COLORED_QUALITY })

      const [srcStat, fullStat] = await Promise.all([
        fs.stat(src),
        fs.stat(fullDest),
      ])
      totalSrc += srcStat.size
      totalFull += fullStat.size
      count += 1
      console.log(
        `${`${suit}/${file}`.padEnd(38)} ${kb(srcStat.size).padStart(7)} → full ${kb(fullStat.size).padStart(7)}`,
      )
    }
  }

  console.log()
  console.log(`originals (colored minors, ${count}): ${mb(totalSrc)}`)
  console.log(
    `full q${MINOR_COLORED_QUALITY}: ${mb(totalFull)}  (${pct(totalFull, totalSrc)} of originals)`,
  )
}

async function main() {
  await optimizeMajors()
  await optimizeMinorsColored()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
