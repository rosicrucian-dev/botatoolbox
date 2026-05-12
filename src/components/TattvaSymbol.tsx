import { tattvaByKind, type TattvaKind } from '@/lib/tattvas'
import { getColor } from '@/lib/colors'

// 200x200 viewBox. All geometry below is in viewBox units.
const VBOX = 200

// Macro outlines are drawn as thick hollow strokes — except Water, which
// is rendered as a filled top-half and a thin full-circle outline.
const MACRO_STROKE = 14
const WATER_OUTLINE = 2
// The "lit" half of the moon. Filled solid (rather than transparent) so
// the moon reads as a complete shape regardless of slide background.
// Resolved at module load via the palette so the value is centralized.
const WATER_LIT = getColor('white') ?? '#FFFFFF'

// Crescent geometry — single source of truth for both the dark-arc path
// and the water sub-tattva slot, so the slot stays in sync if these are
// tuned. See `crescentDarkPath` for what `*_FROM_TOP` mean.
const WATER_HORNS_FROM_TOP = 0.4
const WATER_DIP_FROM_TOP = 0.65
// Vertical breathing room above and below the water sub-symbol within
// the lit band, as a fraction of the outer circle's diameter.
const WATER_SUB_PADDING = 0.05

// The water sub-tattva sits in the lit area below the inner arc's dip.
// Vertically centered between (dip + padding) and (bottom − padding);
// radius is half that band's height.
function waterSubSlot(cx: number, cy: number, r: number) {
  const diameter = 2 * r
  const dipY = cy - r + diameter * WATER_DIP_FROM_TOP
  const bottomY = cy + r
  const pad = diameter * WATER_SUB_PADDING
  const subTop = dipY + pad
  const subBot = bottomY - pad
  return {
    cx,
    cy: (subTop + subBot) / 2,
    r: (subBot - subTop) / 2,
  }
}

// For each main tattva, where the sub-tattva centers and how big it can
// be. Slot radius is the half-extent of the sub's bounding box; sub
// shapes scale to fit inside this.
const SLOTS: Record<TattvaKind, { cx: number; cy: number; r: number }> = {
  // Center of square's interior.
  earth: { cx: 100, cy: 100, r: 25 },
  // Lit lower band of the moon; derived from the crescent geometry above.
  water: waterSubSlot(100, 100, 80),
  // Triangle centroid is at y = (top + 2*base)/3 = (25 + 2*170)/3 ≈ 122.
  fire: { cx: 100, cy: 125, r: 25 },
  // Center of circle.
  air: { cx: 100, cy: 100, r: 30 },
  // Center of vesica.
  spirit: { cx: 100, cy: 100, r: 25 },
}

// Builds the SVG path for a vesica piscis — pointed-tipped lens. Pointed
// tips are at (cx, cy ± h/2) and the vesica is `w` wide at its midline.
//
// Construction: the shape is bounded by two circular arcs whose centers
// sit horizontally on either side of the vesica. From the requirement
// that each arc passes through both tips and the opposite-side equator
// point, the radius works out to (h² + w²) / (4w).
function vesicaPath(cx: number, cy: number, h: number, w: number): string {
  const R = (h * h + w * w) / (4 * w)
  const top = cy - h / 2
  const bot = cy + h / 2
  return `M ${cx} ${top} A ${R} ${R} 0 0 1 ${cx} ${bot} A ${R} ${R} 0 0 1 ${cx} ${top} Z`
}

// Builds the SVG path for the *dark* portion of a crescent moon —
// "moon-shaped," not a half-disc. Outer circle is (cx, cy, r). Two free
// parameters control the look, both measured as fractions from the top
// of the outer circle (0 = top, 0.5 = equator, 1 = bottom):
//   hornsFromTop: y-position of the cusps where the inner arc meets the
//                 outer circle.
//   dipFromTop:   y-position of the lowest point of the inner arc.
// Constraint: dipFromTop > hornsFromTop (the dip sits below the horns).
// Defaults of 0.25 and 0.5 put the cusps a quarter way down and the
// deepest curve at the equator — a balanced upper crescent.
function crescentDarkPath(
  cx: number,
  cy: number,
  r: number,
  hornsFromTop = 0.4,
  dipFromTop = 0.65,
): string {
  const top = cy - r
  const hornY = top + 2 * r * hornsFromTop
  const dipY = top + 2 * r * dipFromTop
  // Horizontal half-width of the outer circle at the horn altitude.
  const dy = hornY - cy
  const dx = Math.sqrt(r * r - dy * dy)
  const leftX = cx - dx
  const rightX = cx + dx
  // The inner arc passes through both horns and the dip. By symmetry
  // its center is on the vertical line through cx; solve for its y
  // from the equal-radius condition between (horn) and (dip).
  const innerCy =
    (dipY * dipY - hornY * hornY - dx * dx) / (2 * (dipY - hornY))
  const innerR = dipY - innerCy
  // Both arcs traverse clockwise (sweep=1):
  //   - Outer: left horn → up over the top → right horn. When horns
  //     sit below the equator the chord is below center and "over the
  //     top" is the LARGE arc; when horns sit above (the typical case
  //     for these defaults) it's the SMALL arc.
  //   - Inner: right horn → through the dip → left horn. Always the
  //     small arc; the inner circle's center sits well above the dip.
  const outerLargeArc = hornY >= cy ? 1 : 0
  return [
    `M ${leftX} ${hornY}`,
    `A ${r} ${r} 0 ${outerLargeArc} 1 ${rightX} ${hornY}`,
    `A ${innerR} ${innerR} 0 0 1 ${leftX} ${hornY}`,
    'Z',
  ].join(' ')
}

export function TattvaSymbol({
  main,
  sub,
  className,
}: {
  main: TattvaKind
  sub: TattvaKind
  className?: string
}) {
  const slot = SLOTS[main]
  return (
    <svg
      viewBox={`0 0 ${VBOX} ${VBOX}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'block h-full w-full'}
    >
      <Macro kind={main} />
      <SubSymbol kind={sub} cx={slot.cx} cy={slot.cy} r={slot.r} />
    </svg>
  )
}

function Macro({ kind }: { kind: TattvaKind }) {
  const t = tattvaByKind[kind]
  // Resolve the palette name to a hex once — every branch below just
  // uses the resolved value as a stroke/fill.
  const stroke = getColor(t.color) ?? '#888'
  switch (kind) {
    case 'earth':
      // Hollow yellow square — interior shows the slide's flash bg.
      return (
        <rect
          x={40}
          y={40}
          width={120}
          height={120}
          fill="none"
          stroke={stroke}
          strokeWidth={MACRO_STROKE}
        />
      )
    case 'water':
      // Crescent-moon shape, drawn as three layers in z-order:
      //   1. White-filled disc (the lit half of the moon).
      //   2. Dark crescent on top — covers the unlit portion.
      //   3. Thin outline so the silhouette stays defined where the lit
      //      half meets the slide background.
      return (
        <>
          <circle cx={100} cy={100} r={80} fill={WATER_LIT} />
          <path
            d={crescentDarkPath(
              100,
              100,
              80,
              WATER_HORNS_FROM_TOP,
              WATER_DIP_FROM_TOP,
            )}
            fill={stroke}
          />
          <circle
            cx={100}
            cy={100}
            r={80}
            fill="none"
            stroke={stroke}
            strokeWidth={WATER_OUTLINE}
          />
        </>
      )
    case 'fire':
      return (
        <polygon
          points="100,25 25,170 175,170"
          fill="none"
          stroke={stroke}
          strokeWidth={MACRO_STROKE}
          strokeLinejoin="miter"
        />
      )
    case 'air':
      return (
        <circle
          cx={100}
          cy={100}
          r={80}
          fill="none"
          stroke={stroke}
          strokeWidth={MACRO_STROKE}
        />
      )
    case 'spirit':
      // Vesica with pointed tips at (100, 20) and (100, 180); width 80
      // at midline. Per vesicaPath: R = (160² + 80²)/(4·80) = 100.
      return (
        <path
          d={vesicaPath(100, 100, 160, 80)}
          fill="none"
          stroke={stroke}
          strokeWidth={MACRO_STROKE}
        />
      )
  }
}

function SubSymbol({
  kind,
  cx,
  cy,
  r,
}: {
  kind: TattvaKind
  cx: number
  cy: number
  r: number
}) {
  const t = tattvaByKind[kind]
  const fill = getColor(t.color) ?? '#888'
  switch (kind) {
    case 'earth':
      return (
        <rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          fill={fill}
        />
      )
    case 'water':
      // Same crescent-moon construction as the macro, scaled to the slot.
      // Lit-disc filled white so the sub-moon reads as a complete shape
      // even when sitting on a non-white parent interior (e.g. inside
      // Earth's dark indigo background).
      return (
        <>
          <circle cx={cx} cy={cy} r={r} fill={WATER_LIT} />
          <path
            d={crescentDarkPath(
              cx,
              cy,
              r,
              WATER_HORNS_FROM_TOP,
              WATER_DIP_FROM_TOP,
            )}
            fill={fill}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={fill}
            strokeWidth={1.2}
          />
        </>
      )
    case 'fire': {
      // Equilateral triangle inscribed in a circle of radius r, apex up.
      // Vertices: (cx, cy - r), and base corners at ±r·sin60°, +r·cos60°.
      const s = r * Math.sin(Math.PI / 3)
      const c = r * Math.cos(Math.PI / 3)
      return (
        <polygon
          points={`${cx},${cy - r} ${cx - s},${cy + c} ${cx + s},${cy + c}`}
          fill={fill}
        />
      )
    }
    case 'air':
      return <circle cx={cx} cy={cy} r={r} fill={fill} />
    case 'spirit':
      // Smaller vesica matching the macro's 2:1 aspect ratio.
      return <path d={vesicaPath(cx, cy, r * 2, r)} fill={fill} />
  }
}
