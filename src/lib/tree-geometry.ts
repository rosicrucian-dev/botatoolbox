// Pure geometry for the Tree of Life diagram — no data imports, so the
// client-side renderer (TreeOfLifeSvg) can import it without pulling
// @/content/data into the browser bundle. The data join (positions +
// sephiroth records) lives in tree-layout.ts, which is server-side.
//
// Coordinates are in user space within the diagram's viewBox
// (`TREE_VIEWBOX`).

export const TREE_VIEWBOX = '0 10 400 680'

// The 10 sephiroth occupy fixed positions on the BOTA tree; this module
// owns those coordinates so they don't pollute the attribution data in
// content/data/sephiroth.json.
export const POSITIONS: Record<string, { cx: number; cy: number }> = {
  kether: { cx: 200, cy: 50 },
  chokmah: { cx: 330, cy: 125 },
  binah: { cx: 70, cy: 125 },
  chesed: { cx: 330, cy: 275 },
  geburah: { cx: 70, cy: 275 },
  tiphareth: { cx: 200, cy: 350 },
  netzach: { cx: 330, cy: 425 },
  hod: { cx: 70, cy: 425 },
  yesod: { cx: 200, cy: 500 },
  malkuth: { cx: 200, cy: 650 },
}
