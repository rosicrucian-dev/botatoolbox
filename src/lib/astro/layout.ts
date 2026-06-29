// Geometry for the two-ring chart wheel. Pure functions over a fixed viewBox
// so the renderer stays declarative and every tunable lives in one place.
// Mirrors the `*-layout.ts` convention (cf. tree-layout.ts).
//
// The viewBox, centre, orientation, and angle maths are screen-size
// independent. The *ring proportions* are not: because the SVG scales
// uniformly, a phone renders the same proportions at ~half the pixels, which
// reads as thin/small. So ring widths and glyph sizes come from a `RingProfile`
// — a chunkier MOBILE_RINGS profile keeps the wheel legible on small screens
// while DESKTOP_RINGS preserves the roomier desktop look.
//
//   ┌─ ASTRO_VIEWBOX (1000×1000) ─┐
//   │   outer ring: 12 zodiac     │
//   │   inner ring: planet discs  │
//   │   (empty centre)            │
//   └─────────────────────────────┘

export const ASTRO_VIEWBOX = '0 0 1000 1000'
export const CENTER = { x: 500, y: 500 } as const

// A set of ring-band sizes, in viewBox units. The knobs to nudge while
// eyeballing the wheel. `planetWidth`/`planetPadding` drive the planet disc
// size, so discs rescale automatically when you retune a band.
export interface RingProfile {
  outerEdge: number // outermost radius (just inside the 1000×1000 box)
  zodiacWidth: number // thickness of the outer (zodiac) band
  gap: number // space between the two bands
  planetWidth: number // thickness of the inner (planet) band
  planetPadding: number // inset of each planet disc from its band edges
  zodiacGlyphSize: number // sign glyph font size
  aspectLineWidth: number // aspect line stroke width
}

// Desktop — the roomier proportions.
export const DESKTOP_RINGS: RingProfile = {
  outerEdge: 492,
  zodiacWidth: 82,
  gap: 0,
  planetWidth: 82,
  planetPadding: 7,
  zodiacGlyphSize: 42,
  aspectLineWidth: 4,
}

// Mobile — thicker bands, bigger discs, smaller hollow centre, so the wheel
// stays legible at phone size.
export const MOBILE_RINGS: RingProfile = {
  outerEdge: 496,
  zodiacWidth: 104,
  gap: 0,
  planetWidth: 108,
  planetPadding: 6,
  zodiacGlyphSize: 52,
  aspectLineWidth: 5,
}

export interface RingMetrics {
  zodiacOuter: number
  zodiacInner: number
  planetOuter: number
  planetInner: number
  zodiacMid: number
  planetMid: number
  planetWidth: number
  planetRadius: number
  zodiacGlyphSize: number
  planetGlyphSize: number
  aspectLineWidth: number
}

/** Derive concrete radii and sizes (outer → inner) from a ring profile. */
export function ringMetrics(p: RingProfile): RingMetrics {
  const zodiacOuter = p.outerEdge
  const zodiacInner = zodiacOuter - p.zodiacWidth
  const planetOuter = zodiacInner - p.gap
  const planetInner = planetOuter - p.planetWidth
  const planetRadius = p.planetWidth / 2 - p.planetPadding
  return {
    zodiacOuter,
    zodiacInner,
    planetOuter,
    planetInner,
    zodiacMid: (zodiacOuter + zodiacInner) / 2,
    planetMid: (planetOuter + planetInner) / 2,
    planetWidth: p.planetWidth,
    planetRadius,
    zodiacGlyphSize: p.zodiacGlyphSize,
    // Astro glyphs read large; modest sizing relative to the disc. Tunable.
    planetGlyphSize: Math.round(planetRadius * 1.05),
    aspectLineWidth: p.aspectLineWidth,
  }
}

// Orientation knobs (screen-size independent). `ARIES_AT` is the screen angle
// (degrees) where 0° Aries sits: 180 = 9 o'clock (left), the conventional
// anchor. `DIRECTION` = +1 advances the zodiac counterclockwise on screen.
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
