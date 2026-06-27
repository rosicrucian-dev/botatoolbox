// Generates a printable, foldable paper "Cube of Space" net as a PDF.
//
// The on-screen 3D cube (src/components/CubeCanvas.tsx) is viewed from the
// INSIDE. This produces the inverse: a flat cruciform net you print, cut,
// and fold into a real paper cube viewed from the OUTSIDE — same walls,
// same edge colors, same tarot wraps, turned inside-out.
//
// Pipeline: build an SVG net (single source of truth, openable in a
// browser for fast iteration) -> rasterize with sharp at 300dpi -> wrap in
// an A4 + Letter PDF with pdf-lib.
//
//   npm run gen:cube-pdf            # writes public/files/cube-of-space-net-{a4,letter}.pdf
//   npm run gen:cube-pdf -- --preview   # writes only a PNG to .cube-pdf-tmp/ (or $SCRATCH)
//
// Iterate on look & feel by turning the knobs in CONFIG, then re-run.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'

const ROOT = path.resolve(import.meta.dirname, '..')

// ---------------------------------------------------------------------------
// CONFIG — the knobs to turn while iterating on look & feel.
// ---------------------------------------------------------------------------
const CONFIG = {
  faceMM: 64, // edge length of one cube face (~6.4cm cube; near the max a 3-wide
  //             cross net allows on both A4 and Letter — bump toward 66 only if
  //             your printer prints to a ~4mm margin).
  borderT3D: 0.12, // colored edge-band thickness, in 3D units (face = 4 units)
  centerCardScale: 1.45, // 1.0 = match-3D; larger = card-forward (capped before it hits the wraps)
  tabDepthMM: 7, // glue-flap depth
  tabInsetMM: 5, // 45-ish corner clip on flaps so they don't collide at cube corners
  bleedMM: 1.0, // color extension past cut edges
  marginXMM: 3, // side margins — kept small to maximise the cube
  marginTopMM: 3,
  marginBottomMM: 9, // room for the Chariot flap that sticks down below the cross
  mirror: true, // horizontal flip so the assembled cube reads correctly from OUTSIDE
  previewDPI: 150,
  outDPI: 300,
}

// ---------------------------------------------------------------------------
// DATA — mirrored from CubeCanvas.tsx so the paper cube matches the 3D one.
// ---------------------------------------------------------------------------
const FHL: Record<string, string> = {
  red: '#AC2721',
  'red-orange': '#B92D1C',
  orange: '#E65C29',
  'orange-yellow': '#E78732',
  yellow: '#F5E652',
  'yellow-green': '#75AC4A',
  green: '#397351',
  'green-blue': '#30608D',
  blue: '#264AA9',
  'blue-violet': '#3C409E',
  violet: '#3C2070',
  'violet-red': '#5B206B',
}

interface Card {
  num: number
  slug: string
  color: string
}
const cards: Card[] = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/data/tarot.json'), 'utf8'),
)
const cardBySlug: Record<string, Card> = Object.fromEntries(
  cards.map((c) => [c.slug, c]),
)
const colorOf = (slug: string) => FHL[cardBySlug[slug].color.toLowerCase()] ?? '#888'

// 12 edges -> zodiac card (CubeCanvas.tsx lines 27-40)
const edges: Record<string, string> = {
  'T-E': 'the-lovers', 'T-N': 'the-star', 'T-W': 'temperance', 'T-S': 'strength',
  'B-E': 'the-chariot', 'B-N': 'the-moon', 'B-W': 'the-devil', 'B-S': 'the-hermit',
  NE: 'the-hierophant', SE: 'the-emperor', SW: 'justice', NW: 'death',
}

type Side = 'top' | 'bottom' | 'left' | 'right'
interface FaceDef {
  id: string
  cardSlug: string
  borders: Record<Side, string>
  set: 'lateral' | 'above' | 'below'
  cardRotZ?: number
}
const faces: Record<string, FaceDef> = {
  east: { id: 'east', cardSlug: 'the-empress', borders: { top: 'T-E', bottom: 'B-E', right: 'NE', left: 'SE' }, set: 'lateral' },
  west: { id: 'west', cardSlug: 'the-wheel-of-fortune', borders: { top: 'T-W', bottom: 'B-W', right: 'SW', left: 'NW' }, set: 'lateral' },
  above: { id: 'above', cardSlug: 'the-magician', borders: { top: 'T-N', bottom: 'T-S', right: 'T-E', left: 'T-W' }, set: 'above', cardRotZ: -Math.PI / 2 },
  below: { id: 'below', cardSlug: 'high-priestess', borders: { top: 'B-S', bottom: 'B-N', right: 'B-E', left: 'B-W' }, set: 'below', cardRotZ: -Math.PI / 2 },
  north: { id: 'north', cardSlug: 'the-sun', borders: { top: 'T-N', bottom: 'B-N', right: 'NW', left: 'NE' }, set: 'lateral' },
  south: { id: 'south', cardSlug: 'the-tower', borders: { top: 'T-S', bottom: 'B-S', right: 'SE', left: 'SW' }, set: 'lateral' },
}

interface HalfSpec {
  size: [number, number]
  position: [number, number]
  rotZ: number
  uvOffset: [number, number]
  uvRepeat: [number, number]
}
const halfCard: Record<string, Record<Side, HalfSpec>> = {
  lateral: {
    top: { size: [1.0, 0.8], position: [0, 1.6], rotZ: 0, uvOffset: [0, 0], uvRepeat: [1, 0.5] },
    bottom: { size: [1.0, 0.8], position: [0, -1.6], rotZ: 0, uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
    right: { size: [0.5, 1.6], position: [1.75, 0], rotZ: 0, uvOffset: [0, 0], uvRepeat: [0.5, 1] },
    left: { size: [0.5, 1.6], position: [-1.75, 0], rotZ: 0, uvOffset: [0.5, 0], uvRepeat: [0.5, 1] },
  },
  above: {
    top: { size: [1.0, 0.8], position: [0, 1.6], rotZ: Math.PI, uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
    bottom: { size: [1.0, 0.8], position: [0, -1.6], rotZ: 0, uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
    right: { size: [1.0, 0.8], position: [1.6, 0], rotZ: Math.PI / 2, uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
    left: { size: [1.0, 0.8], position: [-1.6, 0], rotZ: -Math.PI / 2, uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
  },
  below: {
    top: { size: [1.0, 0.8], position: [0, 1.6], rotZ: 0, uvOffset: [0, 0], uvRepeat: [1, 0.5] },
    bottom: { size: [1.0, 0.8], position: [0, -1.6], rotZ: Math.PI, uvOffset: [0, 0], uvRepeat: [1, 0.5] },
    right: { size: [1.0, 0.8], position: [1.6, 0], rotZ: -Math.PI / 2, uvOffset: [0, 0], uvRepeat: [1, 0.5] },
    left: { size: [1.0, 0.8], position: [-1.6, 0], rotZ: Math.PI / 2, uvOffset: [0, 0], uvRepeat: [1, 0.5] },
  },
}

// ---------------------------------------------------------------------------
// GRID / DIRECTION HELPERS — net cells, and how a tile's local sides map to
// page directions once it is rotated.
// ---------------------------------------------------------------------------
interface Placement { faceId: string; col: number; row: number; rot: number }
const SIDES: Side[] = ['top', 'bottom', 'left', 'right']
const DIRS: Record<string, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const OPP: Record<string, string> = { up: 'down', down: 'up', left: 'right', right: 'left' }
const baseVec: Record<Side, [number, number]> = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] }
const rotCW = ([x, y]: [number, number], deg: number): [number, number] => {
  let n = (((deg / 90) % 4) + 4) % 4
  for (let i = 0; i < n; i++) [x, y] = [-y, x]
  return [x, y]
}
const dirName = ([x, y]: [number, number]) =>
  Object.entries(DIRS).find(([, [dx, dy]]) => dx === x && dy === y)![0]
const localSideToNet = (side: Side, rot: number) => dirName(rotCW(baseVec[side], rot))
const cellKey = (c: number, r: number) => `${c},${r}`
// the other face that shares this edge
const faceSharingEdge = (edgeId: string, exceptId: string) =>
  Object.values(faces).find((f) => f.id !== exceptId && SIDES.some((s) => f.borders[s] === edgeId))!
// the tile rotation (0/90/180/270) that makes `side` point toward `netDir`
const rotationFacing = (side: Side, netDir: string) =>
  [0, 90, 180, 270].find((r) => localSideToNet(side, r) === netDir)!

// ---------------------------------------------------------------------------
// NET BUILDER — unfold the cube into a Latin cross from a root face placed at
// the centre with a chosen rotation. Each neighbour is rotated so the shared
// edge faces back across the fold, which keeps every edge-wrap registered.
// `above` (Magician) is always the centre; rootRot 270 stands the Magician
// upright (its art points to its east edge, so Empress unfolds onto the top
// square and the other faces follow from the cube's geometry).
// ---------------------------------------------------------------------------
const CROSS_CELLS = new Set(['1,1', '1,0', '1,2', '1,3', '0,1', '2,1'])

function buildLayout(rootId: string, rootRot: number): Placement[] {
  const placed = new Map<string, Placement>()
  const root: Placement = { faceId: rootId, col: 1, row: 1, rot: rootRot }
  placed.set('1,1', root)
  const queue: Placement[] = [root]
  while (queue.length) {
    const p = queue.shift()!
    const f = faces[p.faceId]
    for (const side of SIDES) {
      const netDir = localSideToNet(side, p.rot)
      const [dx, dy] = DIRS[netDir]
      const nc = cellKey(p.col + dx, p.row + dy)
      if (!CROSS_CELLS.has(nc) || placed.has(nc)) continue
      const nbr = faceSharingEdge(f.borders[side], p.faceId)
      const nbrSide = SIDES.find((s) => nbr.borders[s] === f.borders[side])!
      const np: Placement = {
        faceId: nbr.id,
        col: p.col + dx,
        row: p.row + dy,
        rot: rotationFacing(nbrSide, OPP[netDir]),
      }
      placed.set(nc, np)
      queue.push(np)
    }
  }
  return [...placed.values()]
}

const layout = buildLayout('above', 270)

// ---------------------------------------------------------------------------
// SIDE / TAB TOPOLOGY — work out which edges fold and which need glue flaps.
// ---------------------------------------------------------------------------
const occupied = new Map<string, Placement>()
for (const p of layout) occupied.set(cellKey(p.col, p.row), p)

interface SideInfo {
  p: Placement
  localSide: Side
  netDir: string
  edgeId: string
  kind: 'fold' | 'tab' | 'land'
  match?: number
}
const sideInfos: SideInfo[] = []
const foldSeen = new Set<string>() // dedupe internal folds (drawn once)
const perimeter: SideInfo[] = []
for (const p of layout) {
  const f = faces[p.faceId]
  for (const localSide of ['top', 'bottom', 'left', 'right'] as Side[]) {
    const netDir = localSideToNet(localSide, p.rot)
    const [dx, dy] = DIRS[netDir]
    const nKey = cellKey(p.col + dx, p.row + dy)
    const edgeId = f.borders[localSide]
    if (occupied.has(nKey)) {
      const key = [cellKey(p.col, p.row), nKey].sort().join('|')
      if (!foldSeen.has(key)) {
        foldSeen.add(key)
        sideInfos.push({ p, localSide, netDir, edgeId, kind: 'fold' })
      }
    } else {
      const info: SideInfo = { p, localSide, netDir, edgeId, kind: 'land' }
      perimeter.push(info)
      sideInfos.push(info)
    }
  }
}
// Pin which face carries the glue flap for every edge so all flaps sit on the
// cross's vertical spine (Empress/east on top, Wheel/west, High Priestess/below
// at the bottom) and the two arms (Sun/north, Tower/south) stay flap-free. Each
// edge can only go to one of the two faces it joins, so every assignment below
// names a spine face. (T-E/T-W/T-N/T-S and B-W are internal folds, not flaps.)
const TAB_OVERRIDE: Record<string, string> = {
  NE: 'east', SE: 'east', // Empress (top square)
  NW: 'west', SW: 'west', // Wheel (middle square)
  'B-N': 'below', 'B-S': 'below', 'B-E': 'below', // High Priestess (bottom square)
}

// pair perimeter sides by edge, assign one flap per pair, load-balanced by cell
const byEdge = new Map<string, SideInfo[]>()
for (const s of perimeter) (byEdge.get(s.edgeId) ?? byEdge.set(s.edgeId, []).get(s.edgeId)!).push(s)
const tabsPerCell = new Map<string, number>()
let matchNo = 0
for (const [edgeId, pair] of byEdge) {
  matchNo++
  const forced = TAB_OVERRIDE[edgeId]
  // forced face, else whichever cell currently carries fewer flaps
  const tab = forced
    ? (pair.find((s) => s.p.faceId === forced) ?? pair[0])
    : pair.sort((a, b) => (tabsPerCell.get(a.p.faceId) ?? 0) - (tabsPerCell.get(b.p.faceId) ?? 0))[0]
  tab.kind = 'tab'
  tabsPerCell.set(tab.p.faceId, (tabsPerCell.get(tab.p.faceId) ?? 0) + 1)
  for (const s of pair) s.match = matchNo
}

// ---------------------------------------------------------------------------
// GEOMETRY HELPERS
// ---------------------------------------------------------------------------
const S = CONFIG.faceMM
const k = S / 4
const fx = (x: number) => (x + 2) * k
const fy = (y: number) => (2 - y) * k
const cellOX = (col: number) => CONFIG.marginXMM + col * S
const cellOY = (row: number) => CONFIG.marginTopMM + row * S
// the side segment (page mm) + outward normal, for a placed cell + net direction
function sideSegment(p: Placement, netDir: string) {
  const ox = cellOX(p.col)
  const oy = cellOY(p.row)
  const seg = {
    up: { a: [ox, oy], b: [ox + S, oy], n: [0, -1] },
    down: { a: [ox, oy + S], b: [ox + S, oy + S], n: [0, 1] },
    left: { a: [ox, oy], b: [ox, oy + S], n: [-1, 0] },
    right: { a: [ox + S, oy], b: [ox + S, oy + S], n: [1, 0] },
  }[netDir]!
  return seg as { a: number[]; b: number[]; n: number[] }
}

// ---------------------------------------------------------------------------
// IMAGE EMBEDDING — base64 data URIs (librsvg loads data:, not file: hrefs)
// ---------------------------------------------------------------------------
const imgCache = new Map<string, string>()
function dataUri(slug: string): string {
  if (imgCache.has(slug)) return imgCache.get(slug)!
  const c = cardBySlug[slug]
  const p = path.join(ROOT, 'public/tarot/major', `${c.num}-${c.slug}.jpg`)
  const uri = `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`
  imgCache.set(slug, uri)
  return uri
}

// ---------------------------------------------------------------------------
// FACE RENDERER — one tile in local coords (0..S, y down), then placed.
// Split into two layers so the fold lines can be drawn BETWEEN them (walls
// below the lines, tarot cards above the lines).
// ---------------------------------------------------------------------------
let uid = 0
const MIR = CONFIG.mirror
// In mirror mode the whole net is flipped horizontally (so the cube reads
// correctly from OUTSIDE). Each raster then gets an extra flip about its OWN
// centre — two flips cancel the image chirality, so the art stays readable
// while only its position mirrors. flipOpen takes the image's local centre x.
const flipOpen = (localCx: number) =>
  MIR ? `<g transform="matrix(-1 0 0 1 ${(2 * localCx).toFixed(2)} 0)">` : ''
const flipClose = MIR ? '</g>' : ''

const placed = (p: Placement, inner: string) =>
  `<g transform="translate(${cellOX(p.col)},${cellOY(p.row)}) rotate(${p.rot},${S / 2},${S / 2})">${inner}</g>`

// layer 1: wall + mitered colored edge bands
function renderFaceBase(p: Placement): string {
  const f = faces[p.faceId]
  const T = CONFIG.borderT3D
  const parts: string[] = [
    `<rect x="0" y="0" width="${S}" height="${S}" fill="${colorOf(f.cardSlug)}"/>`,
  ]
  const bandPts: Record<Side, [number, number][]> = {
    top: [[-2 + T, 2 - T], [2 - T, 2 - T], [2, 2], [-2, 2]],
    bottom: [[2 - T, -2 + T], [-2 + T, -2 + T], [-2, -2], [2, -2]],
    left: [[-2 + T, -2 + T], [-2 + T, 2 - T], [-2, 2], [-2, -2]],
    right: [[2 - T, 2 - T], [2 - T, -2 + T], [2, -2], [2, 2]],
  }
  for (const side of ['top', 'bottom', 'left', 'right'] as Side[]) {
    const pts = bandPts[side].map(([x, y]) => `${fx(x).toFixed(2)},${fy(y).toFixed(2)}`).join(' ')
    parts.push(`<polygon points="${pts}" fill="${colorOf(edges[f.borders[side]])}"/>`)
  }
  return placed(p, parts.join(''))
}

// layer 2: edge-wrap half-cards + the enlarged center card (drawn above folds)
function renderFaceCards(p: Placement): string {
  const f = faces[p.faceId]
  const parts: string[] = []

  for (const side of ['top', 'bottom', 'left', 'right'] as Side[]) {
    const spec = halfCard[f.set][side]
    const [w, h] = spec.size
    const ww = w * k, hh = h * k, Wf = 1.0 * k, Hf = 1.6 * k
    const ucx = spec.uvOffset[0] + spec.uvRepeat[0] / 2
    const ucy = spec.uvOffset[1] + spec.uvRepeat[1] / 2
    const dx = (0.5 - ucx) * Wf
    const dy = -(0.5 - ucy) * Hf
    const cx = fx(spec.position[0]), cy = fy(spec.position[1])
    const rot = -(spec.rotZ * 180) / Math.PI
    const id = `clip${uid++}`
    parts.push(
      `<g transform="translate(${cx.toFixed(2)},${cy.toFixed(2)}) rotate(${rot.toFixed(2)})">` +
        `<clipPath id="${id}"><rect x="${(-ww / 2).toFixed(2)}" y="${(-hh / 2).toFixed(2)}" width="${ww.toFixed(2)}" height="${hh.toFixed(2)}"/></clipPath>` +
        `<g clip-path="url(#${id})">` +
          flipOpen(dx) +
          `<image href="${dataUri(edges[f.borders[side]])}" x="${(dx - Wf / 2).toFixed(2)}" y="${(dy - Hf / 2).toFixed(2)}" width="${Wf.toFixed(2)}" height="${Hf.toFixed(2)}" preserveAspectRatio="none"/>` +
          flipClose +
        `</g>` +
      `</g>`,
    )
  }

  {
    const Wf = 1.0 * k * CONFIG.centerCardScale
    const Hf = 1.6 * k * CONFIG.centerCardScale
    const cx = fx(0), cy = fy(0)
    const rot = -((f.cardRotZ ?? 0) * 180) / Math.PI
    parts.push(
      `<g transform="translate(${cx.toFixed(2)},${cy.toFixed(2)}) rotate(${rot.toFixed(2)})">` +
        flipOpen(0) +
        `<image href="${dataUri(f.cardSlug)}" x="${(-Wf / 2).toFixed(2)}" y="${(-Hf / 2).toFixed(2)}" width="${Wf.toFixed(2)}" height="${Hf.toFixed(2)}" preserveAspectRatio="none"/>` +
        flipClose +
      `</g>`,
    )
  }

  return placed(p, parts.join(''))
}

// ---------------------------------------------------------------------------
// FLAPS + FOLD/CUT LINES + MATCH NUMBERS
// ---------------------------------------------------------------------------
// Fold lines: solid + soft white, so they read as a crease on the coloured
// walls but vanish under the tarot cards (cards are drawn on top of them).
// Cut lines: solid dark, drawn above everything as the cutting guide.
const FOLD_LINE = 'stroke="#ffffff" stroke-opacity="0.5" stroke-width="0.5" stroke-linecap="round" fill="none"'
// Cut lines are semi-transparent too so the wall/edge colour shows through —
// a slightly messy cut then won't leave a hard dark line on the cube's edges.
const CUT_LINE = 'stroke="#111" stroke-opacity="0.5" stroke-width="0.5" fill="none"'

interface TopoParts {
  bleeds: string
  tabFills: string
  foldLines: string
  cutLines: string
}
function renderTopology(): TopoParts {
  const bleeds: string[] = []
  const tabFills: string[] = []
  const foldLines: string[] = []
  const cutLines: string[] = []
  const D = CONFIG.tabDepthMM, INS = CONFIG.tabInsetMM, BL = CONFIG.bleedMM

  // No match numbers: each edge card is split across its seam, so aligning the
  // two halves of the same tarot card is the registration guide.
  for (const s of sideInfos) {
    const { a, b, n } = sideSegment(s.p, s.netDir)
    const t = [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])] // along-edge unit
    if (s.kind === 'fold') {
      foldLines.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${FOLD_LINE}/>`)
    } else if (s.kind === 'land') {
      // perimeter bleed: extend the rim colour 1mm past the cut edge so a
      // slightly-wide cut still shows colour. The rim is the EDGE band, not
      // the wall, so bleed the edge colour (not the face's wall colour).
      bleeds.push(`<polygon points="${a[0]},${a[1]} ${a[0] + n[0] * BL},${a[1] + n[1] * BL} ${b[0] + n[0] * BL},${b[1] + n[1] * BL} ${b[0]},${b[1]}" fill="${colorOf(edges[s.edgeId])}"/>`)
      cutLines.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${CUT_LINE}/>`)
    } else {
      // tab (trapezoid), folds inward at its base
      const o1 = [a[0] + n[0] * D + t[0] * INS, a[1] + n[1] * D + t[1] * INS]
      const o2 = [b[0] + n[0] * D - t[0] * INS, b[1] + n[1] * D - t[1] * INS]
      tabFills.push(`<polygon points="${a[0]},${a[1]} ${o1[0]},${o1[1]} ${o2[0]},${o2[1]} ${b[0]},${b[1]}" fill="${colorOf(edges[s.edgeId])}" fill-opacity="0.9"/>`)
      foldLines.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${FOLD_LINE}/>`) // base
      cutLines.push(`<polyline points="${a[0]},${a[1]} ${o1[0]},${o1[1]} ${o2[0]},${o2[1]} ${b[0]},${b[1]}" ${CUT_LINE}/>`)
    }
  }
  return {
    bleeds: bleeds.join(''),
    tabFills: tabFills.join(''),
    foldLines: foldLines.join(''),
    cutLines: cutLines.join(''),
  }
}

// ---------------------------------------------------------------------------
// TITLE / INSTRUCTIONS / LEGEND (placed in the cross's empty corners)
// ---------------------------------------------------------------------------
function renderChrome(): string {
  const tl = { x: cellOX(0) + 2, y: cellOY(0) + 3 } // top-left empty cell
  const serif = 'font-family="Georgia,\'Times New Roman\',serif"'
  const sans = 'font-family="Helvetica,Arial,sans-serif"'
  const instr = [
    '1. Print at 100%.',
    '2. Cut the dark lines.',
    '3. Fold the pale lines.',
    '4. Glue flaps to edges.',
  ]
  const lines: string[] = []
  lines.push(`<text x="${tl.x}" y="${tl.y + 6}" ${serif} font-size="8" letter-spacing="0.5" fill="#111">THE CUBE</text>`)
  lines.push(`<text x="${tl.x}" y="${tl.y + 14.5}" ${serif} font-size="8" letter-spacing="0.5" fill="#111">OF SPACE</text>`)
  lines.push(`<line x1="${tl.x}" y1="${tl.y + 18}" x2="${tl.x + 40}" y2="${tl.y + 18}" stroke="#111" stroke-width="0.3"/>`)
  instr.forEach((t, i) =>
    lines.push(`<text x="${tl.x}" y="${tl.y + 24 + i * 4.3}" ${sans} font-size="3.2" fill="#222">${t}</text>`),
  )
  return lines.join('')
}

// ---------------------------------------------------------------------------
// ASSEMBLE SVG
// ---------------------------------------------------------------------------
function buildSvg(): { svg: string; w: number; h: number } {
  const w = CONFIG.marginXMM * 2 + 3 * S
  const h = CONFIG.marginTopMM + CONFIG.marginBottomMM + 4 * S
  const topo = renderTopology()
  // z-order: walls/bands -> bleed -> flap fills -> FOLD lines -> cards -> CUT lines
  const netInner =
    layout.map(renderFaceBase).join('') +
    topo.bleeds +
    topo.tabFills +
    topo.foldLines +
    layout.map(renderFaceCards).join('') +
    topo.cutLines
  // mirror the whole net horizontally so it reads correctly from OUTSIDE; chrome
  // (title/legend/instructions) stays un-mirrored so its text is readable.
  const net = MIR ? `<g transform="translate(${w} 0) scale(-1 1)">${netInner}</g>` : netInner
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">` +
    `<rect width="${w}" height="${h}" fill="white"/>` +
    net +
    renderChrome() +
    `</svg>`
  return { svg, w, h }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
const preview = process.argv.includes('--preview')
const { svg, w, h } = buildSvg()

// log the computed flap topology so the net is verifiable without eyeballing
console.log('Flap pairing (match# -> edge, TAB cell / LAND cell):')
const pairLog = new Map<number, { edge: string; tab?: string; land?: string }>()
for (const s of sideInfos) {
  if (s.kind === 'fold' || s.match == null) continue
  const e = pairLog.get(s.match) ?? { edge: `${s.edgeId} (${edges[s.edgeId]})` }
  if (s.kind === 'tab') e.tab = s.p.faceId
  else e.land = s.p.faceId
  pairLog.set(s.match, e)
}
for (const [m, e] of [...pairLog.entries()].sort((a, b) => a[0] - b[0]))
  console.log(`  ${m}: ${e.edge.padEnd(22)} tab=${e.tab}  land=${e.land}`)

const scratch = process.env.SCRATCH ?? path.join(ROOT, '.cube-pdf-tmp')
fs.mkdirSync(scratch, { recursive: true })
fs.writeFileSync(path.join(scratch, 'cube-net.svg'), svg)

const dpi = preview ? CONFIG.previewDPI : CONFIG.outDPI
const png = await sharp(Buffer.from(svg), { density: dpi }).png().toBuffer()
fs.writeFileSync(path.join(scratch, 'cube-net.png'), png)
console.log(`\nwrote ${path.join(scratch, 'cube-net.svg')}`)
console.log(`wrote ${path.join(scratch, 'cube-net.png')} (${w.toFixed(0)}x${h.toFixed(0)}mm @ ${dpi}dpi)`)

if (!preview) {
  const PAGES = {
    a4: [210, 297],
    letter: [215.9, 279.4],
  } as const
  for (const [name, [pw, ph]] of Object.entries(PAGES)) {
    const doc = await PDFDocument.create()
    const mm2pt = (mm: number) => (mm * 72) / 25.4
    const page = doc.addPage([mm2pt(pw), mm2pt(ph)])
    // JPEG embed: PNG of this photo-heavy net is ~44MB; mozjpeg q88 -> a few MB
    const jpg = await sharp(png).flatten({ background: '#fff' }).jpeg({ quality: 88, mozjpeg: true }).toBuffer()
    const img = await doc.embedJpg(jpg)
    const netW = mm2pt(w), netH = mm2pt(h)
    const x = (mm2pt(pw) - netW) / 2
    const y = (mm2pt(ph) - netH) / 2
    page.drawImage(img, { x, y, width: netW, height: netH })
    const out = path.join(ROOT, 'public/files', `cube-of-space-net-${name}.pdf`)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, await doc.save())
    console.log(`wrote ${out}`)
  }

  // lightweight web preview for the /files viewer (PDFs can't be <img>-ed)
  const previewOut = path.join(ROOT, 'public/files', 'cube-of-space-net-preview.jpg')
  await sharp(png).resize({ width: 1200 }).flatten({ background: '#fff' }).jpeg({ quality: 82, mozjpeg: true }).toFile(previewOut)
  console.log(`wrote ${previewOut}`)
}
