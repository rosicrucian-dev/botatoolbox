// Aspects — significant angular separations between two bodies. Derived purely
// from the longitudes already in a `Chart`, so this needs no ephemeris and
// touches neither the engine nor the `Chart` model. Framework-agnostic and
// deterministic; lifts out with the rest of `lib/astro/`.

import type { BodySlug, Chart } from './types'

export type AspectType =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition'

// Nature drives how the line is drawn (the renderer maps it to a colour);
// 'neutral' aspects (conjunction) are detected but not drawn as a line, since
// the two points coincide on the wheel.
export type AspectNature = 'hard' | 'flowing' | 'neutral'

interface AspectDef {
  type: AspectType
  exact: number // exact separation in degrees
  orb: number // tolerance: counts if |separation − exact| ≤ orb
  nature: AspectNature
}

// The five Ptolemaic majors — the only aspects Astrodienst shows by default.
// Orbs match Liz Greene's per-aspect table, the astro.com natal-chart default:
// 10° for the major angular aspects, 6° for the sextile.
export const ASPECTS: readonly AspectDef[] = [
  { type: 'conjunction', exact: 0, orb: 10, nature: 'neutral' },
  { type: 'sextile', exact: 60, orb: 6, nature: 'flowing' },
  { type: 'square', exact: 90, orb: 10, nature: 'hard' },
  { type: 'trine', exact: 120, orb: 10, nature: 'flowing' },
  { type: 'opposition', exact: 180, orb: 10, nature: 'hard' },
]

export interface Aspect {
  a: BodySlug
  b: BodySlug
  type: AspectType
  exact: number
  orb: number // actual deviation from exact, degrees
  separation: number // actual angular separation, 0–180
  nature: AspectNature
  /** True when the orb is closing toward exact, false when opening (separating). */
  applying: boolean
}

/** Wrap an angle difference into (−180, 180]. */
function wrap180(x: number): number {
  const d = ((x % 360) + 360) % 360
  return d > 180 ? d - 360 : d
}

/**
 * Find every aspect between the chart's bodies. Each pair yields at most one
 * aspect — the closest match within orb (the majors are far enough apart that
 * ties don't realistically occur, but we pick the tightest orb regardless).
 */
export function computeAspects(chart: Chart): Aspect[] {
  const bodies = chart.bodies
  const out: Aspect[] = []
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]
      const b = bodies[j]
      // Signed separation and its rate of change. The actual separation moves
      // at sign(d)·(speedA − speedB); the aspect is applying when that motion
      // carries the separation toward the exact angle.
      const d = wrap180(a.longitude - b.longitude)
      const sep = Math.abs(d)
      const sepRate = Math.sign(d) * (a.speed - b.speed)
      let best: Aspect | null = null
      for (const def of ASPECTS) {
        const orb = Math.abs(sep - def.exact)
        if (orb <= def.orb && (!best || orb < best.orb)) {
          best = {
            a: a.slug,
            b: b.slug,
            type: def.type,
            exact: def.exact,
            orb,
            separation: sep,
            nature: def.nature,
            applying: (sep - def.exact) * sepRate < 0,
          }
        }
      }
      if (best) out.push(best)
    }
  }
  // Tightest (most exact) aspects first.
  return out.sort((x, y) => x.orb - y.orb)
}
