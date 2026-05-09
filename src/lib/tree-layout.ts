// SVG layout for the Tree of Life diagram. The 10 sephiroth occupy fixed
// positions on the BOTA tree; this module owns those coordinates so they
// don't pollute the attribution data in content/data/sephiroth.json.
//
// Coordinates are in user space within the diagram's viewBox
// (`TREE_VIEWBOX`). Both TreeOfLifeSvg and ProgressiveTree use them.

import { sephiroth as baseSephiroth, type Sephirah } from '@/content/data'

export const TREE_VIEWBOX = '0 10 400 680'

const POSITIONS: Record<string, { cx: number; cy: number }> = {
  kether:    { cx: 200, cy: 50 },
  chokmah:   { cx: 330, cy: 125 },
  binah:     { cx: 70,  cy: 125 },
  chesed:    { cx: 330, cy: 275 },
  geburah:   { cx: 70,  cy: 275 },
  tiphareth: { cx: 200, cy: 350 },
  netzach:   { cx: 330, cy: 425 },
  hod:       { cx: 70,  cy: 425 },
  yesod:     { cx: 200, cy: 500 },
  malkuth:   { cx: 200, cy: 650 },
}

export type PlacedSephirah = Sephirah & { cx: number; cy: number }

export const sephiroth: ReadonlyArray<PlacedSephirah> = baseSephiroth.map(
  (s) => {
    const pos = POSITIONS[s.slug]
    if (!pos) throw new Error(`No tree-layout position for sephirah "${s.slug}"`)
    return { ...s, cx: pos.cx, cy: pos.cy }
  },
)
