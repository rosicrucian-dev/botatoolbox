// Generates the social share cards:
//
//   - src/app/opengraph-image.png  1200x630  Open Graph (Facebook, etc.)
//   - src/app/twitter-image.png    1200x630  Twitter/X (identical art)
//
// The card is a centered title + description lockup over the emerald
// scrollwork background. Next.js serves these automatically for the
// matching file conventions. The sister project (../bota-course) carries
// the same card style on its zinc background.
//
// Run with: npm run gen:social  (then commit the two PNGs)

import { join } from 'node:path'
import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630

const BG_IMAGE = join('public', 'background-emerald.png')

// Avenir ships with macOS (Heavy title, Medium description); the SVG is
// rasterized through the system font stack, so nothing lives in the repo.
const FONT = "'Avenir', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const TITLE_WEIGHT = 800 // Avenir Heavy
const DESC_WEIGHT = 500 // Avenir Medium
const TEXT_COLOR = '#FFFFFF'

const TITLE = 'BOTA Toolbox'
const DESC_LINES = [
  'An unofficial set of advanced tools',
  'for members of the Builders of the Adytum',
]

// Type sizes and vertical rhythm: the text block (title + description
// lines) is centered as a whole. SVG text positions use baselines, so
// BASELINE_RATIO maps each line box's top edge to its baseline.
const TITLE_SIZE = 108
const DESC_SIZE = 34
const TITLE_TO_DESC_GAP = 20
const DESC_LINE_HEIGHT = 50
const BASELINE_RATIO = 0.78

const BLOCK_HEIGHT =
  TITLE_SIZE + TITLE_TO_DESC_GAP + DESC_LINE_HEIGHT * DESC_LINES.length
const BLOCK_TOP = Math.round(HEIGHT / 2 - BLOCK_HEIGHT / 2)
const TITLE_BASELINE = Math.round(BLOCK_TOP + TITLE_SIZE * BASELINE_RATIO)
const DESC_FIRST_BASELINE = Math.round(
  BLOCK_TOP + TITLE_SIZE + TITLE_TO_DESC_GAP + DESC_SIZE * BASELINE_RATIO,
)

const foreground = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">` +
    `<g filter="drop-shadow(0 2px 6px rgb(0 0 0 / 0.28))" text-anchor="middle" font-family="${FONT}" fill="${TEXT_COLOR}">` +
    `<text x="${WIDTH / 2}" y="${TITLE_BASELINE}" font-size="${TITLE_SIZE}" font-weight="${TITLE_WEIGHT}">${TITLE}</text>` +
    DESC_LINES.map(
      (line, i) =>
        `<text x="${WIDTH / 2}" y="${DESC_FIRST_BASELINE + i * DESC_LINE_HEIGHT}" font-size="${DESC_SIZE}" font-weight="${DESC_WEIGHT}">${line}</text>`,
    ).join('') +
    `</g>` +
    `</svg>`,
)

const card = await sharp(BG_IMAGE)
  .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'north' })
  .composite([{ input: foreground, left: 0, top: 0 }])
  .png()
  .toBuffer()

for (const file of [
  join('src', 'app', 'opengraph-image.png'),
  join('src', 'app', 'twitter-image.png'),
]) {
  await sharp(card).toFile(file)
  console.log(`gen-social: ${file} (${WIDTH}x${HEIGHT})`)
}
