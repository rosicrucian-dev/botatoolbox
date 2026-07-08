// A tessellating field of isometric cubes — the "tumbling blocks"
// (rhombille) tiling — echoing the BOTA cube logo. Each cube is three
// 60°/120° rhombi (top, left, right) in one green hue at three low
// opacities, so it reads as an extremely subtle three-shade pattern.
// Used by HeroPattern as the homepage background wash.
//
// Geometry note: the cubes tile with lattice vectors (2A, 0) and
// (A, 3H) where H = A/√3 — the exact rhombille lattice, so faces meet
// edge-to-edge with no gaps. We draw a full field (not an SVG <pattern>)
// so there's no tile-seam to get wrong; it's homepage-only and masked.

// Half-width of a cube in viewBox units; H is the short vertical radius.
const A = 60
const H = A / Math.sqrt(3)

// viewBox matches HeroPattern's fixed box (w-325 = 1300px, h-100 = 400px),
// so a cube renders ~120px wide on screen.
const VW = 1300
const VH = 400

// Per-face fill, as Tailwind `fill` classes so light and dark can differ.
// Light mode: a mid green (green-500) at tiny alphas over white. Dark mode
// needs a LIGHTER green (green-300) at HIGHER alphas — green at low alpha
// over near-black barely registers, so matching the light values would
// vanish. Stepping top < left < right gives the 3D read. These are the
// main "how subtle" knobs.
const FACE = {
  top: 'fill-green-500/[0.05] dark:fill-green-400/[0.05]',
  left: 'fill-green-500/[0.09] dark:fill-green-400/[0.08]',
  right: 'fill-green-500/[0.13] dark:fill-green-400/[0.12]',
}

const f = (n: number) => n.toFixed(2)

// Every lattice cube whose box intersects the viewBox (+1 ring of margin,
// since the mask fades the edges anyway). cx,cy is the cube's top vertex.
const cubes: Array<{ cx: number; cy: number }> = []
for (let j = -1; j <= 3; j++) {
  const cy = 3 * H * j
  for (let i = -1; i <= 13; i++) {
    cubes.push({ cx: 2 * A * i + A * j, cy })
  }
}

export function CubePattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      {cubes.map(({ cx, cy }, k) => (
        <g key={k}>
          <polygon
            className={FACE.top}
            points={`${f(cx)},${f(cy)} ${f(cx + A)},${f(cy + H)} ${f(cx)},${f(cy + 2 * H)} ${f(cx - A)},${f(cy + H)}`}
          />
          <polygon
            className={FACE.left}
            points={`${f(cx - A)},${f(cy + H)} ${f(cx)},${f(cy + 2 * H)} ${f(cx)},${f(cy + 4 * H)} ${f(cx - A)},${f(cy + 3 * H)}`}
          />
          <polygon
            className={FACE.right}
            points={`${f(cx + A)},${f(cy + H)} ${f(cx)},${f(cy + 2 * H)} ${f(cx)},${f(cy + 4 * H)} ${f(cx + A)},${f(cy + 3 * H)}`}
          />
        </g>
      ))}
    </svg>
  )
}
