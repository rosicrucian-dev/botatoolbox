// Tattvas — the 5 elements as drawn in the Golden Dawn / BOTA tradition.
// Pure code module: the structure (5 elements) is fixed by tradition,
// and `color` / `flashBg` / `text` are *palette references* whose hex
// values live in `staticColors` inside `src/lib/colors.ts`. To re-tone
// any tattva, edit colors.ts.
//
// Each main tattva has:
//   - color:   the symbol's own color (yellow square, blue circle, etc.)
//   - flashBg: the complementary "flashing" background filling the slide
//   - text:    the foreground color readable on flashBg (light or dark)
//
// Sub-tattvas are rendered as small *filled* shapes in the same `color`,
// no flashing background.

export type TattvaKind = 'earth' | 'water' | 'fire' | 'air' | 'spirit'

export interface Tattva {
  kind: TattvaKind
  english: string
  color: string
  flashBg: string
  text: string
}

export const tattvas: ReadonlyArray<Tattva> = [
  { kind: 'earth',  english: 'Earth',  color: 'tattva-earth',  flashBg: 'tattva-earth-bg',  text: 'tattva-text-light' },
  { kind: 'water',  english: 'Water',  color: 'tattva-water',  flashBg: 'tattva-water-bg',  text: 'tattva-text-dark'  },
  { kind: 'fire',   english: 'Fire',   color: 'tattva-fire',   flashBg: 'tattva-fire-bg',   text: 'tattva-text-light' },
  { kind: 'air',    english: 'Air',    color: 'tattva-air',    flashBg: 'tattva-air-bg',    text: 'tattva-text-light' },
  { kind: 'spirit', english: 'Spirit', color: 'tattva-spirit', flashBg: 'tattva-spirit-bg', text: 'tattva-text-light' },
]

export const tattvaByKind = Object.fromEntries(
  tattvas.map((t) => [t.kind, t]),
) as Record<TattvaKind, Tattva>

// Order sub-tattvas in each main's deck the way the historical sheets
// arrange them: Earth → Air → Water → Fire → Spirit.
export const SUB_ORDER: Array<TattvaKind> = [
  'earth',
  'air',
  'water',
  'fire',
  'spirit',
]
