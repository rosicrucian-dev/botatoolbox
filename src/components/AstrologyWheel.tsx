'use client'

// The two-ring chart wheel. Outer ring: twelve zodiac segments labelled with
// their glyphs. Inner ring: a light disc per body, glyph centred, placed at
// its ecliptic longitude. Centre left empty. Pure presentation — it takes a
// `Chart` (or null, before the client has computed one) and the geometry from
// `astro/layout`; it knows nothing about the ephemeris.

import { planetBySlug, signBySlug } from '@/content/data/astrology'
import { useColorPalette } from '@/lib/colorPalette'
import { getColor, textColorFor } from '@/lib/colors'
import {
  angleToPoint,
  annularSectorPath,
  ASTRO_VIEWBOX,
  CENTER,
  DESKTOP_RINGS,
  ringMetrics,
  SEGMENT_BOUNDARIES,
  SEGMENT_CENTERS,
  type RingProfile,
} from '@/lib/astro/layout'
import type { Aspect, AspectNature } from '@/lib/astro/aspects'
import type { BodySlug, Chart } from '@/lib/astro/types'
import { SIGN_SLUGS } from '@/lib/astro/types'

// Aspect nature → line colour. 'neutral' (conjunction) is intentionally empty:
// the two points coincide, so no line is drawn.
const ASPECT_STROKE: Record<AspectNature, string> = {
  hard: 'stroke-red-500/60',
  flowing: 'stroke-blue-500/60',
  neutral: '',
}

// The outer planets are octaves that inherit the same tarot colours as inner
// planets (Uranus≈Mercury yellow, Neptune≈Moon blue, Pluto≈Mars red). Lighten
// their discs toward white so they're distinguishable on the wheel.
const OUTER_PLANETS = new Set<BodySlug>(['uranus', 'neptune', 'pluto'])
const OUTER_LIGHTEN = 0.35 // fraction toward white (0 = unchanged, 1 = white)

// Glyphs sit slightly low under dominant-baseline:central (their typographic
// centre is below their visual centre), so nudge them up by a fraction of the
// glyph size. Scales with the glyph, so it's consistent across ring profiles.
const PLANET_GLYPH_RISE = 0.08

// Disc stacking by mean apparent speed (Chaldean order): slow outer planets at
// the bottom, the fast Moon on top. SVG has no z-index, so we render in this
// order — lowest rank first (drawn first = underneath). A fixed rank (not the
// live speed) keeps stacking stable when a planet stations.
const SPEED_RANK: Record<BodySlug, number> = {
  pluto: 0,
  neptune: 1,
  uranus: 2,
  saturn: 3,
  jupiter: 4,
  mars: 5,
  sun: 6,
  venus: 7,
  mercury: 8,
  moon: 9,
}

/** Mix a hex colour toward white by `amount` (0–1). Non-hex input is returned as-is. */
function lighten(hex: string, amount: number): string {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return hex
  let h = match[1]
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  const channel = (i: number) => parseInt(h.slice(i, i + 2), 16)
  const mix = (c: number) =>
    Math.round(c + (255 - c) * amount)
      .toString(16)
      .padStart(2, '0')
  return `#${mix(channel(0))}${mix(channel(2))}${mix(channel(4))}`
}

export function AstrologyWheel({
  chart,
  aspects = [],
  profile = DESKTOP_RINGS,
}: {
  chart: Chart | null
  aspects?: Aspect[]
  profile?: RingProfile
}) {
  // Respects the user's colour palette (FLO / Apple) from Settings; planets
  // render in their attributed BOTA colour (Mercury yellow, Venus green, …).
  const { colorPalette } = useColorPalette()
  const m = ringMetrics(profile)

  // Longitude per body, for placing aspect-line endpoints.
  const lonBySlug: Partial<Record<BodySlug, number>> = {}
  chart?.bodies.forEach((b) => {
    lonBySlug[b.slug] = b.longitude
  })

  return (
    <svg
      viewBox={ASTRO_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Current planetary positions on the zodiac wheel"
    >
      {/* ── Outer ring: coloured zodiac segments (no borders — adjacent
          colours separate the signs) and their glyphs ── */}
      {SEGMENT_BOUNDARIES.map((lon, i) => {
        const sign = signBySlug[SIGN_SLUGS[i]]
        return (
          <path
            key={`seg-${SIGN_SLUGS[i]}`}
            d={annularSectorPath(lon, lon + 30, m.zodiacInner, m.zodiacOuter)}
            fill={getColor(sign.color, colorPalette) ?? '#888'}
          />
        )
      })}

      {SEGMENT_CENTERS.map((lon, i) => {
        const p = angleToPoint(lon, m.zodiacMid)
        const sign = signBySlug[SIGN_SLUGS[i]]
        return (
          <text
            key={`sign-${SIGN_SLUGS[i]}`}
            x={p.x}
            y={p.y}
            fontSize={m.zodiacGlyphSize}
            textAnchor="middle"
            dominantBaseline="central"
            fill={textColorFor(sign.color) ?? 'white'}
          >
            {/* U+FE0E forces text (monochrome) presentation, so Apple renders
                the sign as a plain symbol instead of a colour emoji. */}
            {`${sign.glyph}\uFE0E`}
          </text>
        )
      })}

      {/* ── Inner ring: a light-gray band that holds the planet discs, drawn
          as a thick stroke spanning the band's width. No borders. ── */}
      <circle
        cx={CENTER.x}
        cy={CENTER.y}
        r={m.planetMid}
        fill="none"
        className="stroke-zinc-200 dark:stroke-zinc-800"
        strokeWidth={m.planetWidth}
      />

      {/* ── Aspect lines across the empty centre, under the discs ── */}
      {aspects.map((asp) => {
        const stroke = ASPECT_STROKE[asp.nature]
        const la = lonBySlug[asp.a]
        const lb = lonBySlug[asp.b]
        if (!stroke || la === undefined || lb === undefined) return null
        const p1 = angleToPoint(la, m.planetInner)
        const p2 = angleToPoint(lb, m.planetInner)
        return (
          <line
            key={`asp-${asp.a}-${asp.b}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            className={stroke}
            strokeWidth={m.aspectLineWidth}
          />
        )
      })}

      {/* Planets only appear once the client has computed the chart. Drawn
          slowest-first so faster planets stack on top at conjunctions. */}
      {chart?.bodies
        .slice()
        .sort((a, b) => SPEED_RANK[a.slug] - SPEED_RANK[b.slug])
        .map((body) => {
        const p = angleToPoint(body.longitude, m.planetMid)
        const planet = planetBySlug[body.slug]
        const base = getColor(planet.color, colorPalette) ?? '#888'
        const fill = OUTER_PLANETS.has(body.slug)
          ? lighten(base, OUTER_LIGHTEN)
          : base
        return (
          <g key={body.slug}>
            <circle cx={p.x} cy={p.y} r={m.planetRadius} fill={fill} />
            <text
              x={p.x}
              y={p.y - m.planetGlyphSize * PLANET_GLYPH_RISE}
              fontSize={m.planetGlyphSize}
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColorFor(planet.color) ?? 'white'}
            >
              {/* U+FE0E forces text (monochrome) presentation. Without it,
                  symbols with a default emoji form (e.g. ♀, ♆) render as emoji
                  that ignore dominant-baseline and sit low in the disc. */}
              {`${planet.glyph}\uFE0E`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
