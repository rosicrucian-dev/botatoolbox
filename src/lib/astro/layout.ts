// Geometry for the two-ring chart wheel. Pure functions over a fixed viewBox
// so the renderer stays declarative and every tunable lives in one place.
// Mirrors the `*-layout.ts` convention (cf. tree-layout.ts): one exported
// viewBox constant plus the coordinate maths, shared by the renderer.
//
//   ┌─ ASTRO_VIEWBOX (1000×1000) ─┐
//   │   outer ring: 12 zodiac     │  ZODIAC_INNER..ZODIAC_OUTER
//   │   ─── gap ───               │
//   │   inner ring: planet circles│  PLANET_INNER..PLANET_OUTER
//   │   (empty centre)            │
//   └─────────────────────────────┘

export const ASTRO_VIEWBOX = '0 0 1000 1000'
export const CENTER = { x: 500, y: 500 } as const

// Tunable band geometry. These are the knobs to nudge while eyeballing the
// wheel in the dev server — ring thicknesses, the space between them, and how
// far each planet disc is inset from its band. The planet disc radius derives
// from `planetWidth`/`planetPadding`, so planets rescale automatically when
// you retune the inner band.
export const RING = {
  outerEdge: 492, // outermost radius (just inside the 1000×1000 box)
  zodiacWidth: 82, // thickness of the outer (zodiac) band — matches planet band
  gap: 0, // bands share a border (no space between them)
  planetWidth: 82, // thickness of the inner (planet) band — matches zodiac band
  planetPadding: 7, // inset of each planet disc from its band edges
} as const

// Derived radii (outer → inner).
export const ZODIAC_OUTER = RING.outerEdge
export const ZODIAC_INNER = ZODIAC_OUTER - RING.zodiacWidth
export const PLANET_OUTER = ZODIAC_INNER - RING.gap
export const PLANET_INNER = PLANET_OUTER - RING.planetWidth

// Mid-radii: where glyphs / discs are centred within their band.
export const ZODIAC_MID = (ZODIAC_OUTER + ZODIAC_INNER) / 2
export const PLANET_MID = (PLANET_OUTER + PLANET_INNER) / 2

// Radius of a planet disc — half the band minus a little padding.
export const PLANET_RADIUS = RING.planetWidth / 2 - RING.planetPadding

// Glyph sizes in viewBox units. Astro glyphs render as colour emoji on Apple
// platforms and read large, so these are deliberately modest (the app applies
// `grayscale` to tame them, cf. AstrologyFocusPlayer). Both are tunable.
export const ZODIAC_GLYPH_SIZE = 42
export const PLANET_GLYPH_SIZE = Math.round(PLANET_RADIUS * 1.05)

// Aspect lines are drawn across the empty centre, ending at the planet band's
// inner edge (`PLANET_INNER`). Width is tunable here.
export const ASPECT_LINE_WIDTH = 4

// Orientation knobs. `ARIES_AT` is the screen angle (degrees) where 0° Aries
// sits: 180 = the 9 o'clock position (left), the conventional chart anchor.
// `DIRECTION` = +1 advances the zodiac counterclockwise on screen, as in a
// standard wheel.
export const ARIES_AT = 180
export const DIRECTION = 1

export interface Point {
  x: number
  y: number
}

/**
 * Map an ecliptic longitude (0–360) and a radius to an SVG point. The minus on
 * the y-term flips SVG's downward y-axis so that increasing longitude advances
 * counterclockwise on screen (when DIRECTION = +1).
 */
export function angleToPoint(longitude: number, radius: number): Point {
  const deg = ARIES_AT + DIRECTION * longitude
  const rad = (deg * Math.PI) / 180
  return {
    x: CENTER.x + radius * Math.cos(rad),
    y: CENTER.y - radius * Math.sin(rad),
  }
}

/**
 * SVG path for an annular sector (a ring wedge) spanning [startLon, endLon]
 * between two radii — used to fill each zodiac segment with its colour. Both
 * arcs use large-arc-flag 0 (segments are 30°, well under 180°); the outer arc
 * is drawn counterclockwise on screen (sweep 0, increasing longitude) and the
 * inner arc back clockwise (sweep 1), matching `angleToPoint`'s orientation.
 */
export function annularSectorPath(
  startLon: number,
  endLon: number,
  innerR: number,
  outerR: number,
): string {
  const o1 = angleToPoint(startLon, outerR)
  const o2 = angleToPoint(endLon, outerR)
  const i2 = angleToPoint(endLon, innerR)
  const i1 = angleToPoint(startLon, innerR)
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 0 0 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${innerR} ${innerR} 0 0 1 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ')
}

/** The twelve segment-boundary longitudes: [0, 30, 60, … 330]. */
export const SEGMENT_BOUNDARIES = Array.from({ length: 12 }, (_, i) => i * 30)

/** The twelve segment-centre longitudes (where glyphs sit): [15, 45, … 345]. */
export const SEGMENT_CENTERS = Array.from({ length: 12 }, (_, i) => i * 30 + 15)
