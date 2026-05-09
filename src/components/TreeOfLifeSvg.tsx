import Link from 'next/link'

import { paths } from '@/content/data'
import { cardBySlug, cardImage } from '@/content/data/tarot'
import { getColor, textColorFor } from '@/lib/colors'
import {
  sephiroth,
  TREE_VIEWBOX,
  type PlacedSephirah,
} from '@/lib/tree-layout'

const sephBySlug: Record<string, PlacedSephirah> = Object.fromEntries(
  sephiroth.map((s) => [s.slug, s]),
)

// The full Tree of Life — 22 paths (each linked to a tarot major) + 10
// sephiroth (each linked to its detail page). Container sets the size;
// SVG uses preserveAspectRatio="xMidYMid meet" so it scales to fit.
export function TreeOfLifeSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox={TREE_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'h-full w-full'}
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        {paths.map((path) => {
          const a = sephBySlug[path.from]
          const b = sephBySlug[path.to]
          const card = cardBySlug[path.slug]
          if (!a || !b || !card) return null
          const mx = (a.cx + b.cx) / 2
          const my = (a.cy + b.cy) / 2
          let angle =
            (Math.atan2(b.cy - a.cy, b.cx - a.cx) * 180) / Math.PI
          if (angle > 90) angle -= 180
          if (angle < -90) angle += 180
          let imgRot = angle - 90
          if (imgRot < -90) imgRot += 180
          return (
            <Link key={path.slug} href={`/tarot/${path.slug}`}>
              <g className="group cursor-pointer">
                <title>{`${card.num}. ${card.name}`}</title>
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
                  stroke={getColor(card.color) ?? 'white'}
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
                <image
                  href={cardImage(card)}
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
        {sephiroth.map((s) => {
          const r = 32
          const d = r / Math.sqrt(2)
          return (
            <Link key={s.slug} href={`/tree-of-life/${s.slug}`}>
              <g className="group cursor-pointer">
                <title>{s.name}</title>
                {s.quadrantColors ? (
                  <>
                    <path
                      d={`M ${s.cx},${s.cy} L ${s.cx - d},${s.cy - d} A ${r},${r} 0 0,1 ${s.cx + d},${s.cy - d} Z`}
                      fill={getColor(s.quadrantColors.top) ?? '#888'}
                    />
                    <path
                      d={`M ${s.cx},${s.cy} L ${s.cx + d},${s.cy - d} A ${r},${r} 0 0,1 ${s.cx + d},${s.cy + d} Z`}
                      fill={getColor(s.quadrantColors.right) ?? '#888'}
                    />
                    <path
                      d={`M ${s.cx},${s.cy} L ${s.cx + d},${s.cy + d} A ${r},${r} 0 0,1 ${s.cx - d},${s.cy + d} Z`}
                      fill={getColor(s.quadrantColors.bottom) ?? '#888'}
                    />
                    <path
                      d={`M ${s.cx},${s.cy} L ${s.cx - d},${s.cy + d} A ${r},${r} 0 0,1 ${s.cx - d},${s.cy - d} Z`}
                      fill={getColor(s.quadrantColors.left) ?? '#888'}
                    />
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
                    fill={getColor(s.color) ?? '#888'}
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
                <text
                  x={s.cx}
                  y={s.cy + 4}
                  textAnchor="middle"
                  fill={textColorFor(s.color) ?? 'white'}
                  className={`pointer-events-none font-medium select-none ${
                    s.slug === 'binah' ? 'text-[9px]' : 'text-[11px]'
                  }`}
                >
                  {s.name}
                </text>
              </g>
            </Link>
          )
        })}
      </g>
    </svg>
  )
}
