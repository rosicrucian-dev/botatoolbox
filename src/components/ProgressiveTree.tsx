import { paths } from '@/content/data'
import { getColor } from '@/lib/colors'
import { sephiroth, TREE_VIEWBOX } from '@/lib/tree-layout'

const sephBySlug = Object.fromEntries(sephiroth.map((s) => [s.slug, s]))
const RADIUS = 32
// Half-width of the "column" between the two parallel rails.
const PATH_HALF_WIDTH = 8

// `strokeColor` (when provided) drives the color for paths, inactive
// sephiroth, AND the thicker ring on the active sephirah — so the whole
// diagram tracks the slide's foreground color and stays readable on any
// bg. Without it, falls back to a system dark/light-mode default class.
export function ProgressiveTree({
  filledThrough = -1,
  strokeColor,
}: {
  filledThrough?: number
  strokeColor?: string | null
}) {
  const strokeProps = strokeColor
    ? { stroke: strokeColor }
    : { className: 'stroke-zinc-900 dark:stroke-zinc-100' }

  return (
    <svg
      viewBox={TREE_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        {paths.map((p, i) => {
          const a = sephBySlug[p.from]
          const b = sephBySlug[p.to]
          if (!a || !b) return null
          const dx = b.cx - a.cx
          const dy = b.cy - a.cy
          const len = Math.hypot(dx, dy)
          if (len === 0) return null
          const dirX = dx / len
          const dirY = dy / len
          const perpX = -dirY
          const perpY = dirX
          const chord = Math.sqrt(
            RADIUS * RADIUS - PATH_HALF_WIDTH * PATH_HALF_WIDTH,
          )
          const sx = a.cx + dirX * chord
          const sy = a.cy + dirY * chord
          const ex = b.cx - dirX * chord
          const ey = b.cy - dirY * chord
          return (
            <g key={i}>
              <line
                x1={sx + perpX * PATH_HALF_WIDTH}
                y1={sy + perpY * PATH_HALF_WIDTH}
                x2={ex + perpX * PATH_HALF_WIDTH}
                y2={ey + perpY * PATH_HALF_WIDTH}
                strokeWidth={1.5}
                {...strokeProps}
              />
              <line
                x1={sx - perpX * PATH_HALF_WIDTH}
                y1={sy - perpY * PATH_HALF_WIDTH}
                x2={ex - perpX * PATH_HALF_WIDTH}
                y2={ey - perpY * PATH_HALF_WIDTH}
                strokeWidth={1.5}
                {...strokeProps}
              />
            </g>
          )
        })}
      </g>
      <g>
        {sephiroth.map((s, i) => {
          const filled = i <= filledThrough
          const isActive = i === filledThrough && !!strokeColor
          const sw = isActive ? 8 : 1.5
          if (filled && s.quadrantColors) {
            const d = RADIUS / Math.sqrt(2)
            const q = s.quadrantColors
            return (
              <g key={s.slug}>
                <path
                  d={`M ${s.cx},${s.cy} L ${s.cx - d},${s.cy - d} A ${RADIUS},${RADIUS} 0 0,1 ${s.cx + d},${s.cy - d} Z`}
                  fill={getColor(q.top) ?? '#888'}
                />
                <path
                  d={`M ${s.cx},${s.cy} L ${s.cx + d},${s.cy - d} A ${RADIUS},${RADIUS} 0 0,1 ${s.cx + d},${s.cy + d} Z`}
                  fill={getColor(q.right) ?? '#888'}
                />
                <path
                  d={`M ${s.cx},${s.cy} L ${s.cx + d},${s.cy + d} A ${RADIUS},${RADIUS} 0 0,1 ${s.cx - d},${s.cy + d} Z`}
                  fill={getColor(q.bottom) ?? '#888'}
                />
                <path
                  d={`M ${s.cx},${s.cy} L ${s.cx - d},${s.cy + d} A ${RADIUS},${RADIUS} 0 0,1 ${s.cx - d},${s.cy - d} Z`}
                  fill={getColor(q.left) ?? '#888'}
                />
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={sw}
                  {...strokeProps}
                />
              </g>
            )
          }
          return (
            <circle
              key={s.slug}
              cx={s.cx}
              cy={s.cy}
              r={RADIUS}
              fill={filled ? (getColor(s.color) ?? '#888') : 'transparent'}
              strokeWidth={sw}
              {...strokeProps}
            />
          )
        })}
      </g>
    </svg>
  )
}
