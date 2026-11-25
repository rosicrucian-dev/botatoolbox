// Color palette system. A "palette" is a 16-entry set: the 12-color
// wheel (one per Hebrew letter / tarot path) plus 4 sephirah-specific
// colors (kether, chokmah, binah, malkuth) for the top of the tree and
// the bottom (kingdom/earth). Selectable palettes are registered in
// COLOR_PALETTES below.
//
// Convention used everywhere in the app:
//   - Data files store the color NAME (e.g. 'yellow', 'malkuth').
//   - Components resolve name → hex at render time via getColor(name, palette).
//   - The active palette lives in `useColorPalette` (src/lib/colorPalette.ts).

export type ColorName =
  | 'red'
  | 'red-orange'
  | 'orange'
  | 'orange-yellow'
  | 'yellow'
  | 'yellow-green'
  | 'green'
  | 'green-blue'
  | 'blue'
  | 'blue-violet'
  | 'violet'
  | 'violet-red'
  | 'kether'
  | 'chokmah'
  | 'binah'
  | 'malkuth'

export type ColorPaletteId = 'flo' | 'tailwind'

export interface ColorPalette {
  id: ColorPaletteId
  label: string
}

// Registry — the single source of truth for the selectable color palettes. It
// drives the Settings "Colors" dropdown and palette validation, mirroring
// MAJOR_STYLES / MINOR_STYLES in content/data/tarot-styles.ts: adding a palette
// is a one-line edit here plus its hex table in `palettes` below. 'flo' is the
// Fraternity of the Hidden Light spectrum — the traditional BOTA colors.
export const COLOR_PALETTES: ReadonlyArray<ColorPalette> = [
  { id: 'flo', label: 'FLO' },
  { id: 'tailwind', label: 'Tailwind' },
]

// Single source of truth for the default palette — the useColorPalette() store's
// initial value and the default `palette` arg of getColor.
export const DEFAULT_COLOR_PALETTE: ColorPaletteId = 'tailwind'

export function isColorPalette(id: string): id is ColorPaletteId {
  return COLOR_PALETTES.some((p) => p.id === id)
}

// Tailwind palette. For consistency, only the six RYB anchors — red,
// orange, yellow, green, blue, violet — come straight from Tailwind (at
// their namesake 500 shade), and every in-between (tertiary) slot is the
// RGB midpoint blend of its two neighbors — so each tertiary is a true,
// even step between two anchors rather than a separately-chosen hue.
//
// yellow is the one anchor NOT at 500: it uses the 400 shade. Yellow's
// vibrancy lives at high lightness (it peaks near L 90%), so yellow-500
// reads as a dull mustard next to the other spokes; yellow-400 is the
// vibrant golden yellow the wheel wants.
//
// Hexes are the sRGB forms of Tailwind v4's OKLCH definitions.
const TAILWIND = {
  red: '#FB2C36', // red-500
  orange: '#FF6900', // orange-500
  yellow: '#FDC700', // yellow-400 (see note above), not yellow-500
  green: '#00BC7D', // emerald-500 — matches the primary buttons/links (PlayLink, the Catalyst Expand button)
  blue: '#2B7FFF', // blue-500
  violet: '#8E51FF', // violet-500
  gray: '#6A7282', // gray-500 (for chokmah)
}

function buildTailwindTheme(): Record<ColorName, string> {
  return {
    red: TAILWIND.red,
    'red-orange': blendColors(TAILWIND.red, TAILWIND.orange)!,
    orange: TAILWIND.orange,
    'orange-yellow': blendColors(TAILWIND.orange, TAILWIND.yellow)!,
    yellow: TAILWIND.yellow,
    'yellow-green': blendColors(TAILWIND.yellow, TAILWIND.green)!,
    green: TAILWIND.green,
    'green-blue': blendColors(TAILWIND.green, TAILWIND.blue)!,
    blue: TAILWIND.blue,
    'blue-violet': blendColors(TAILWIND.blue, TAILWIND.violet)!,
    violet: TAILWIND.violet,
    'violet-red': blendColors(TAILWIND.violet, TAILWIND.red)!,
    kether: '#FFFFFF',
    chokmah: TAILWIND.gray,
    binah: '#000000',
    // Channel-wise blend of three lower-tree hues for the earthy Malkuth
    // backdrop, mirroring the FLO palette's construction.
    malkuth: blendColors(TAILWIND.green, TAILWIND.orange, TAILWIND.violet)!,
  }
}

// Theme-invariant colors used by features whose visual identity doesn't
// shift with the BOTA palette. The Golden Dawn flashing-color choices for
// tattvas, for instance, are part of the meditation tradition itself —
// they shouldn't change when the user switches palette. Keys are
// prefixed by feature so they don't collide with the 16-name palette.
const staticColors: Record<string, string> = {
  // Plain monochromes — used as canonical text colors and as the moon's
  // lit half in the Water tattva.
  white: '#FFFFFF',
  black: '#000000',

  // Tattva symbol colors — Golden Dawn canonical, theme-invariant.
  'tattva-earth': '#E8C84A', // yellow square
  'tattva-water': '#0A0A0A', // near-black crescent
  'tattva-fire': '#C8262E', // red triangle
  'tattva-air': '#1F4FB8', // blue circle
  'tattva-spirit': '#1F1A55', // indigo vesica

  // Tattva flashing backgrounds — the complement of each symbol color.
  'tattva-earth-bg': '#1A0F3D', // dark indigo (Earth's complement)
  'tattva-water-bg': '#D8DEE6', // pale silver
  'tattva-fire-bg': '#2E7D5A', // green
  'tattva-air-bg': '#E68C2A', // orange
  'tattva-spirit-bg': '#E68C2A', // orange (same as air)

  // Foreground text colors used over tattva backgrounds.
  'tattva-text-light': '#FFFFFF',
  'tattva-text-dark': '#1F1F1F',
}

const palettes: Record<ColorPaletteId, Record<ColorName, string>> = {
  flo: {
    red: '#AC2721',
    'red-orange': '#B92D1C',
    orange: '#E65C29',
    'orange-yellow': '#E78732',
    yellow: '#F5E652',
    'yellow-green': '#75AC4A',
    green: '#397351',
    'green-blue': '#30608D',
    blue: '#264AA9',
    'blue-violet': '#3C409E',
    violet: '#3C2070',
    'violet-red': '#5B206B',
    kether: '#FFFFFF',
    chokmah: '#A0A0A0',
    binah: '#18181B',
    // Channel-wise blend of the three lower-tree colors (Netzach,
    // Hod, Yesod) at the FHL palette — preserves the muted earth-brown
    // backdrop the original Trestleboard slide used for Malkuth.
    malkuth: blendColors('#397351', '#E65C29', '#3C2070')!,
  },
  tailwind: buildTailwindTheme(),
}

export function getColor(
  name?: string | null,
  palette: ColorPaletteId = DEFAULT_COLOR_PALETTE,
): string | undefined {
  if (!name) return undefined
  const lower = name.toLowerCase()
  const table = palettes[palette]
  if (!table) return undefined
  // Palette colors first, then the palette-invariant static registry (used
  // for feature-specific colors like tattva backgrounds).
  return table[lower as ColorName] ?? staticColors[lower]
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) =>
    Math.round(n).toString(16).padStart(2, '0').toUpperCase()
  return `#${h(r)}${h(g)}${h(b)}`
}

// Channel-wise average of any number of hex colors. Returns a hex string,
// or null when nothing valid was passed. Theme-agnostic — operates on
// resolved hex values.
function blendColors(...hexes: Array<string | undefined>): string | null {
  const valid = hexes
    .filter((c): c is string => typeof c === 'string' && c.startsWith('#'))
    .map(hexToRgb)
  if (valid.length === 0) return null
  const sum = valid.reduce(
    ([r, g, b], c) => [r + c[0], g + c[1], b + c[2]],
    [0, 0, 0],
  )
  return rgbToHex(
    sum[0] / valid.length,
    sum[1] / valid.length,
    sum[2] / valid.length,
  )
}

// Foreground color for text rendered on a slide background: white reads
// cleanly on every saturated palette color; only the two near-white bgs
// (kether and yellow) need dark text. Returns null for slides with no bg
// (so SlidePlayer's dark/light-mode fallback classes apply).
//
// kether (pure white): zinc-900 (#18181b) — max contrast on pure white.
// yellow (vivid): zinc-700 (#3f3f46) — softer dark; pure black on bright
// yellow is harsh on the eye, dark gray reads as more meditative.
export function textColorFor(colorName?: string | null): string | null {
  if (!colorName) return null
  const lower = colorName.toLowerCase()
  if (lower === 'kether') return '#18181b'
  if (lower === 'yellow') return '#3f3f46'
  return 'white'
}
