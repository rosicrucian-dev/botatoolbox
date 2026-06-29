// Ephemeris engine backed by astronomy-engine (MIT, pure JS, no data files).
// Accurate to ~1 arcminute for the planets over 1900–2100 — far finer than a
// sign/degree wheel needs. Isolated behind the `AstroEngine` interface so it
// can be replaced by a Swiss Ephemeris WASM backend without UI changes.
//
// Frame note: astronomy-engine's `EclipticLongitude` is HELIOCENTRIC and is
// the wrong call for a chart. For geocentric tropical longitude we take the
// geocentric J2000 vector and rotate it into the true ecliptic of date:
//   Ecliptic(GeoVector(body, date, true)).elon
// This yields apparent ecliptic-of-date longitude — i.e. the tropical zodiac
// position — uniformly for all ten bodies including the Sun and Moon.

import { Body, Ecliptic, GeoVector } from 'astronomy-engine'
import type { AstroEngine } from './engine'
import type { BodyPosition, BodySlug, Chart } from './types'
import { BODY_SLUGS, signFor } from './types'

const BODY_FOR_SLUG: Record<BodySlug, Body> = {
  sun: Body.Sun,
  moon: Body.Moon,
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
  pluto: Body.Pluto,
}

const DAY_MS = 86_400_000

/** Geocentric apparent ecliptic-of-date (tropical) longitude, 0–360. */
function longitudeAt(body: Body, date: Date): number {
  return Ecliptic(GeoVector(body, date, true)).elon
}

/**
 * Signed apparent longitudinal speed in degrees/day, from a centred difference
 * a day either side. ±1 day keeps us clear of numerical noise; the sign gives
 * retrograde (negative) for free, and the magnitude drives applying/separating
 * aspect detection.
 */
function speedAt(body: Body, date: Date): number {
  const before = longitudeAt(body, new Date(date.getTime() - DAY_MS))
  const after = longitudeAt(body, new Date(date.getTime() + DAY_MS))
  let delta = after - before
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta / 2
}

function positionFor(slug: BodySlug, date: Date): BodyPosition {
  const body = BODY_FOR_SLUG[slug]
  const longitude = longitudeAt(body, date)
  const speed = speedAt(body, date)
  return {
    slug,
    longitude,
    sign: signFor(longitude),
    degreeInSign: longitude % 30,
    speed,
    retrograde: speed < 0,
  }
}

export const astronomyEngine: AstroEngine = {
  async computeChart(date: Date): Promise<Chart> {
    return {
      instant: date.toISOString(),
      bodies: BODY_SLUGS.map((slug) => positionFor(slug, date)),
    }
  },
}
