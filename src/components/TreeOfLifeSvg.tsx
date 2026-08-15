'use client'

import { Link } from '@/components/LocaleLink'

import { thumbImage } from '@/content/data/tarot-images'
import { useColorPalette } from '@/lib/colorPalette'
import { getColor, textColorFor } from '@/lib/colors'
import { useTarotStyle } from '@/lib/tarotStyle'
import { TREE_VIEWBOX } from '@/lib/tree-geometry'
import type { TreeSvgData, TreeSvgSephirah } from '@/lib/tree-layout'

// ---- Flow animation knobs (mirror CubeCanvas where it makes sense) ----
// Per-path particle count, duration (seconds) for one traversal, radius
// in viewBox units, and base opacity. Each path renders FLOW_COUNT
// circles with `begin` offsets to space them out evenly along the path.
const FLOW_COUNT = 3
const FLOW_DURATION = 5
// Path colored lane is strokeWidth=16, so radius 8 fills it edge-to-edge.
const FLOW_SIZE = 8
const FLOW_OPACITY = 0.5

export type FlowDirection = 'descend' | 'ascend'

// The full Tree of Life — 22 paths (each linked to a tarot major) + 10
// sephiroth (each linked to its detail page). Container sets the size;
// SVG uses preserveAspectRatio="xMidYMid meet" so it scales to fit.
// `flow=true` adds animated translucent dots traveling each path.
// `flowDirection` picks between the lightning descent (from→to as
// stored in tree-paths.json, default) and the path of return (to→from).
// `tree` comes from the server parent's treeSvgData(locale) — localized
// display fields ride in as props so the datasets stay out of the
// client bundle.
export function TreeOfLifeSvg({
  tree,
  className,
  flow = false,
  flowDirection = 'descend',
}: {
  tree: TreeSvgData
  className?: string
  flow?: boolean
  flowDirection?: FlowDirection
}) {
  const sephBySlug: Record<string, TreeSvgSephirah> = Object.fromEntries(
    tree.sephiroth.map((s) => [s.slug, s]),
  )
  const { majorStyle } = useTarotStyle()
  const { colorPalette } = useColorPalette()
  return (
    <svg
      viewBox={TREE_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'h-full w-full'}
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        {tree.paths.map((path) => {
          const a = sephBySlug[path.from]
          const b = sephBySlug[path.to]
          if (!a || !b) return null
          const mx = (a.cx + b.cx) / 2
          const my = (a.cy + b.cy) / 2
          let angle = (Math.atan2(b.cy - a.cy, b.cx - a.cx) * 180) / Math.PI
          if (angle > 90) angle -= 180
          if (angle < -90) angle += 180
          let imgRot = angle - 90
          if (imgRot < -90) imgRot += 180
          // Horizontal paths (Empress / Strength / Tower) default to
          // top-points-left, which reads backwards. Flip to
          // top-points-right.
          if (a.cy === b.cy) imgRot = -imgRot
          return (
            <Link key={path.slug} href={`/tarot/${path.slug}`}>
              <g className="group cursor-pointer">
                <title>{`${path.num}. ${path.name}`}</title>
                <line
                  x1={a.cx}
                  y1={a.cy}
                  x2={b.cx}
                  y2={b.cy}
                  strokeWidth={19}
                  className="stroke-black dark:stroke-white"
                />
                <line
                  x1={a.cx}
                  y1={a.cy}
                  x2={b.cx}
                  y2={b.cy}
                  stroke={getColor(path.color, colorPalette) ?? 'white'}
                  strokeWidth={16}
                />
                <line
                  x1={a.cx}
                  y1={a.cy}
                  x2={b.cx}
                  y2={b.cy}
                  stroke="white"
                  strokeWidth={16}
                  className="opacity-0 transition-opacity duration-150 group-hover:opacity-50"
                />
                {flow &&
                  (() => {
                    // Pick endpoints based on direction. Descend (default)
                    // runs the from→to direction stored in
                    // tree-paths.json — the lightning descent. Ascend
                    // reverses to the path of return.
                    const [fromX, fromY, toX, toY] =
                      flowDirection === 'ascend'
                        ? [b.cx, b.cy, a.cx, a.cy]
                        : [a.cx, a.cy, b.cx, b.cy]
                    // Yellow paths (Fool / Magician / Strength) have
                    // poor contrast under translucent white — flip to
                    // translucent black so the dots are still visible.
                    const dotFill = path.color === 'Yellow' ? 'black' : 'white'
                    return Array.from({ length: FLOW_COUNT }, (_, j) => {
                      // Negative begin offsets the start so particles
                      // appear pre-staggered along the path on first
                      // paint — same trick as CubeCanvas' phase.
                      const begin = `${-(j * FLOW_DURATION) / FLOW_COUNT}s`
                      const dur = `${FLOW_DURATION}s`
                      return (
                        <circle
                          key={j}
                          r={FLOW_SIZE}
                          fill={dotFill}
                          opacity={FLOW_OPACITY}
                          className="pointer-events-none"
                        >
                          <animate
                            attributeName="cx"
                            from={fromX}
                            to={toX}
                            dur={dur}
                            begin={begin}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="cy"
                            from={fromY}
                            to={toY}
                            dur={dur}
                            begin={begin}
                            repeatCount="indefinite"
                          />
                        </circle>
                      )
                    })
                  })()}
                <image
                  href={thumbImage(path, majorStyle)}
                  x={mx - 16.5}
                  y={my - 28.5}
                  width={33}
                  height={57}
                  // toFixed pins precision so server-rendered transform
                  // matches client (Math.atan2 differs at the last bit
                  // between Node and Safari, causing hydration warnings).
                  transform={`rotate(${imgRot.toFixed(4)} ${mx} ${my})`}
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            </Link>
          )
        })}
      </g>

      <g>
        {tree.sephiroth.map((s) => {
          const r = 32
          const d = r / Math.sqrt(2)
          return (
            <Link key={s.slug} href={`/tree-of-life/${s.slug}`}>
              <g className="group cursor-pointer">
                <title>{s.name}</title>
                {s.quadrantColors ? (
                  <>
                    {/* Four quarter-circle wedges, clockwise from the top.
                        Each runs center → one corner, arcs to the next. */}
                    {(
                      [
                        ['top', -d, -d, +d, -d],
                        ['right', +d, -d, +d, +d],
                        ['bottom', +d, +d, -d, +d],
                        ['left', -d, +d, -d, -d],
                      ] as const
                    ).map(([quadrant, x1, y1, x2, y2]) => (
                      <path
                        key={quadrant}
                        d={`M ${s.cx},${s.cy} L ${s.cx + x1},${s.cy + y1} A ${r},${r} 0 0,1 ${s.cx + x2},${s.cy + y2} Z`}
                        fill={
                          getColor(s.quadrantColors![quadrant], colorPalette) ??
                          '#888'
                        }
                      />
                    ))}
                    <circle
                      cx={s.cx}
                      cy={s.cy}
                      r={r}
                      fill="none"
                      strokeWidth={1.5}
                      className="stroke-black dark:stroke-white"
                    />
                  </>
                ) : (
                  <circle
                    cx={s.cx}
                    cy={s.cy}
                    r={r}
                    fill={getColor(s.color, colorPalette) ?? '#888'}
                    strokeWidth={1.5}
                    className="stroke-black dark:stroke-white"
                  />
                )}
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={r}
                  fill={s.slug === 'kether' ? 'black' : 'white'}
                  className="opacity-0 transition-opacity duration-150 group-hover:opacity-25"
                />
                {/* Two-line label: English on top, Hebrew name below.
                    Binah's English ("Understanding") gets an extra
                    size bump down so it fits inside the 32-radius
                    circle. */}
                <text
                  textAnchor="middle"
                  fill={textColorFor(s.color) ?? 'white'}
                  className="pointer-events-none font-medium select-none"
                >
                  <tspan
                    x={s.cx}
                    y={s.cy - 3}
                    className={
                      s.slug === 'binah'
                        ? 'text-[8px]'
                        : s.slug === 'yesod'
                          ? 'text-[10px]'
                          : 'text-[12px]'
                    }
                  >
                    {s.name}
                  </tspan>
                  <tspan x={s.cx} y={s.cy + 11} className="text-[12px]">
                    {s.hebrewName}
                  </tspan>
                </text>
              </g>
            </Link>
          )
        })}
      </g>
    </svg>
  )
}
