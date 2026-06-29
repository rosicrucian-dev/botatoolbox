// Domain model for the astrology chart. This is the only contract the UI
// depends on — the ephemeris engine (see engine.ts) produces a `Chart`,
// and the wheel renderer consumes one. Keeping this framework-agnostic and
// engine-agnostic is what lets the whole `src/lib/astro/` module lift out
// into a standalone site later, and lets us swap the engine implementation
// (currently astronomy-engine; Swiss Ephemeris WASM later) without touching
// any rendering code.

// The twelve zodiac signs in tropical order, starting at 0° Aries. This is
// astronomical fact, not app content, so it lives with the engine. The UI
// joins these slugs to glyph/letter/colour data via `signBySlug` from
// `@/content/data/astrology`.
export const SIGN_SLUGS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const

// The ten bodies plotted on the wheel, in the educational order BOTA
// materials use (luminaries first, then by distance from the Sun). Pluto is
// included: it rules nothing in Case's scheme, but a chart still plots where
// it physically is. Joins to `planetBySlug` for glyph/letter data.
export const BODY_SLUGS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const

export type SignSlug = (typeof SIGN_SLUGS)[number]
export type BodySlug = (typeof BODY_SLUGS)[number]

export interface BodyPosition {
  /** Joins to `planetBySlug` for glyph, Hebrew letter, tarot colour. */
  slug: BodySlug
  /** Geocentric apparent ecliptic longitude of date (tropical), 0–360. */
  longitude: number
  /** Sign occupied, derived from longitude. Joins to `signBySlug`. */
  sign: SignSlug
  /** Position within the sign, 0–30. */
  degreeInSign: number
  /** Signed apparent longitudinal speed in degrees/day (negative = retrograde). */
  speed: number
  /** Apparent retrograde motion as seen from Earth (i.e. speed < 0). */
  retrograde: boolean
}

export interface Chart {
  /** ISO timestamp of the moment this chart was computed for. */
  instant: string
  bodies: BodyPosition[]
}

/** Derive the occupied sign slug from an ecliptic longitude (0–360). */
export function signFor(longitude: number): SignSlug {
  const i = Math.floor((((longitude % 360) + 360) % 360) / 30)
  return SIGN_SLUGS[i]
}
