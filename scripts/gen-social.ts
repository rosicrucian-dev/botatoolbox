// Generates the social share cards from the vector source
// (assets/cube.svg):
//
//   - src/app/opengraph-image.png  1200x630  Open Graph (Facebook, etc.)
//   - src/app/twitter-image.png    1200x630  Twitter/X (identical art)
//
// The card is the cube mark on the left with the wordmark, an accent
// underline, and the tagline on the right, over a dark charcoal field —
// the same layout the original hand-made card used, now regenerated so
// it tracks the cube's colors. Next.js serves these automatically for
// the matching file conventions.
//
// Run with: npm run gen:social  (then commit the two PNGs)

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const CUBE_SVG = readFileSync(join('assets', 'cube.svg'))

const WIDTH = 1200
const HEIGHT = 630
const BG = '#1A1A1C' // charcoal, matches the app-icon gradient's base
const ACCENT = '#00BC7D' // emerald-500 — the app accent / primary-button color
const TITLE_COLOR = '#FFFFFF'
const SUBTITLE_COLOR = '#9CA3AF' // zinc-400
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// Cube on the left, vertically centered.
const CUBE_HEIGHT = 360
const CUBE_LEFT = 78

// --- Text column (right of the cube) ---------------------------------------
// Horizontal: every text row AND the accent line share one left edge (LEFT),
// so they're aligned by construction. `<text>` starts its glyph advance at x,
// while `<rect>` starts its box at x; LINE_INSET is the one knob to nudge the
// line if you want its edge to sit under the title's ink rather than flush
// with the geometric edge (0 = flush).
const LEFT = 470
const RIGHT_MARGIN = 72
const COLUMN_WIDTH = WIDTH - LEFT - RIGHT_MARGIN
const LINE_INSET = 0

// Type sizes.
const TITLE_SIZE = 92
const SUBTITLE_SIZE = 33

// Vertical rhythm: laid out top-down from the title baseline via gaps, so
// adjusting one gap shifts everything below it predictably. Text `y` is the
// baseline; the line `y` is its top edge.
const TITLE_BASELINE = 272
const TITLE_TO_LINE = 28 // title baseline → line top
const LINE_HEIGHT = 5
const LINE_TO_SUBTITLE = 60 // line top → first subtitle baseline
const SUBTITLE_LEADING = 46 // subtitle line-to-line
const LINE_TOP = TITLE_BASELINE + TITLE_TO_LINE
const SUB1_BASELINE = LINE_TOP + LINE_TO_SUBTITLE
const SUB2_BASELINE = SUB1_BASELINE + SUBTITLE_LEADING

// Accent line width as a fraction of the text column (not the title's width).
const LINE_RATIO = 0.5
const LINE_WIDTH = Math.round(COLUMN_WIDTH * LINE_RATIO)

const titleRow = (text: string) =>
  `<text x="${LEFT}" y="${TITLE_BASELINE}" font-family="${FONT}" font-size="${TITLE_SIZE}" font-weight="700" fill="${TITLE_COLOR}">${text}</text>`
const subtitleRow = (y: number, text: string) =>
  `<text x="${LEFT}" y="${y}" font-family="${FONT}" font-size="${SUBTITLE_SIZE}" fill="${SUBTITLE_COLOR}">${text}</text>`

const background = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>` +
    titleRow('BOTA Toolbox') +
    `<rect x="${LEFT + LINE_INSET}" y="${LINE_TOP}" width="${LINE_WIDTH}" height="${LINE_HEIGHT}" rx="${LINE_HEIGHT / 2}" fill="${ACCENT}"/>` +
    subtitleRow(SUB1_BASELINE, 'An unofficial set of advanced tools') +
    subtitleRow(SUB2_BASELINE, 'for members of the Builders of the Adytum') +
    `</svg>`,
)

const cube = await sharp(CUBE_SVG)
  .resize({ height: CUBE_HEIGHT })
  .png()
  .toBuffer()
const { width: cubeWidth = 0, height: cubeHeight = 0 } =
  await sharp(cube).metadata()

const card = await sharp(background)
  .composite([
    {
      input: cube,
      left: CUBE_LEFT,
      top: Math.round((HEIGHT - cubeHeight) / 2),
    },
  ])
  .png()
  .toBuffer()

for (const file of [
  join('src', 'app', 'opengraph-image.png'),
  join('src', 'app', 'twitter-image.png'),
]) {
  await sharp(card).toFile(file)
  console.log(`gen-social: ${file} (${WIDTH}x${HEIGHT}), cube ${cubeWidth}px`)
}
