// Color theme system. A "theme" is a 16-entry palette: the 12-color
// wheel (one per Hebrew letter / tarot path) plus 4 sephirah-specific
// colors (kether, chokmah, binah, malkuth) for the top of the tree and
// the bottom (kingdom/earth).
//
// Convention used everywhere in the app:
//   - Data files store the color NAME (e.g. 'yellow', 'malkuth').
//   - Components resolve name → hex at render time via getColor(name, theme).
//   - The active theme lives in `useTheme` (src/lib/theme.ts).

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

export type ThemeId = 'fhl' | 'apple'

export const THEME_IDS: Array<ThemeId> = ['fhl', 'apple']

export const THEME_LABELS: Record<ThemeId, string> = {
  fhl: 'Fraternity of the Hidden Light',
  apple: 'Apple',
}

// Single source of truth for the default theme. Used by:
//   - useTheme() store as the initial value
//   - getColor / getFlashColor / flashOf as their default `theme` arg
//   - the `colors` backward-compat alias
export const DEFAULT_THEME: ThemeId = 'fhl'

// Apple system colors (iOS). Used as anchors for the apple theme; the
// 12-wheel midpoints between adjacent anchors are blended at module load.
const APPLE = {
  red: '#FF383C',
  orange: '#FF8D28',
  yellow: '#FFCC00',
  green: '#34C759',
  teal: '#00C3D0',
  blue: '#0088FF',
  indigo: '#6155F5',
  purple: '#CB30E0',
  pink: '#FF2D55',
  brown: '#AC7F5E',
  gray: '#8E8E93',
}

// Build the apple theme by blending three midpoints between Apple's
// six base hues. Apple supplies its own teal/indigo/pink as the other
// three midpoints, so the user's spec maps:
//   green-blue → teal, blue-violet → indigo, violet-red → pink
function buildAppleTheme(): Record<ColorName, string> {
  return {
    red: APPLE.red,
    'red-orange': blendColors(APPLE.red, APPLE.orange)!,
    orange: APPLE.orange,
    'orange-yellow': blendColors(APPLE.orange, APPLE.yellow)!,
    yellow: APPLE.yellow,
    'yellow-green': blendColors(APPLE.yellow, APPLE.green)!,
    green: APPLE.green,
    'green-blue': blendColors(APPLE.green, APPLE.blue)!,
    blue: APPLE.blue,
    'blue-violet': APPLE.indigo,
    violet: APPLE.purple,
    'violet-red': blendColors(APPLE.purple, APPLE.red)!,
    kether: '#FFFFFF',
    chokmah: APPLE.gray,
    binah: '#000000',
    malkuth: APPLE.brown,
  }
}

// Theme-invariant colors used by features whose visual identity doesn't
// shift with the BOTA palette. The Golden Dawn flashing-color choices for
// tattvas, for instance, are part of the meditation tradition itself —
// they shouldn't change when the user picks the Apple theme. Keys are
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

const themes: Record<ThemeId, Record<ColorName, string>> = {
  fhl: {
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
  apple: buildAppleTheme(),
}

// Backward-compat alias: code that wants raw hex without caring about
// theme gets the default theme's palette. New code should call getColor()
// with an explicit theme instead.
export const colors = themes[DEFAULT_THEME]

export function getColor(
  name?: string | null,
  theme: ThemeId = DEFAULT_THEME,
): string | undefined {
  if (!name) return undefined
  const lower = name.toLowerCase()
  const palette = themes[theme]
  if (!palette) return undefined
  // Theme palette first, then the theme-invariant static registry (used
  // for feature-specific colors like tattva backgrounds).
  return palette[lower as ColorName] ?? staticColors[lower]
}

// Wheel order — only the 12-color wheel; the 4 sephirah colors don't
// have a meaningful complement on the wheel.
const wheel = [
  'red',
  'red-orange',
  'orange',
  'orange-yellow',
  'yellow',
  'yellow-green',
  'green',
  'green-blue',
  'blue',
  'blue-violet',
  'violet',
  'violet-red',
] as const

// The complementary color on the wheel (180° around). Used for "flash"
// foreground colors over a colored bg.
export function getFlashColor(
  name?: string | null,
  theme: ThemeId = DEFAULT_THEME,
): string | undefined {
  if (!name) return undefined
  const idx = wheel.indexOf(name.toLowerCase() as (typeof wheel)[number])
  if (idx === -1) return undefined
  const flashName = wheel[(idx + 6) % wheel.length]
  return themes[theme]?.[flashName]
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
export function blendColors(
  ...hexes: Array<string | undefined>
): string | null {
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

// Foreground color for text rendered on a slide background. Use this in
// place of getFlashColor: white reads cleanly on every saturated palette
// color; only the two near-white bgs (kether and yellow) need dark text.
// Returns null for slides with no bg (so SlidePlayer's dark/light-mode
// fallback classes apply).
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

// Flash for an arbitrary color value — accepts a palette name OR a hex
// (which gets reverse-looked-up in the palette to find its name first).
// Special-cases white ↔ black for the kether/binah literals.
export function flashOf(
  color?: string | null,
  theme: ThemeId = DEFAULT_THEME,
): string | undefined {
  if (!color) return undefined
  if (color === 'white' || color === '#FFFFFF') return 'black'
  if (color === 'black' || color === '#000000') return 'white'
  const palette = themes[theme]
  if (!palette) return undefined
  const lower = color.toLowerCase()
  if (palette[lower as ColorName]) return getFlashColor(lower, theme)
  const entry = Object.entries(palette).find(
    ([, hex]) => hex.toLowerCase() === lower,
  )
  if (entry) return getFlashColor(entry[0], theme)
  return undefined
}
