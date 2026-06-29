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

      {/* Planets only appear once the client has computed the chart. */}
      {chart?.bodies.map((body) => {
        const p = angleToPoint(body.longitude, m.planetMid)
        const planet = planetBySlug[body.slug]
        const fill = getColor(planet.color, colorPalette) ?? '#888'
        return (
          <g key={body.slug}>
            <circle cx={p.x} cy={p.y} r={m.planetRadius} fill={fill} />
            <text
              x={p.x}
              y={p.y}
              fontSize={m.planetGlyphSize}
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColorFor(planet.color) ?? 'white'}
              className="grayscale"
            >
              {planet.glyph}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
