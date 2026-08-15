// Freeform tabletop domain: coordinate math, deck geometry, and spread
// persistence. Pure functions + constants — the React state machine that
// uses them lives in components/useFreeformSpread.ts. Deliberately free
// of @/content/data imports (this ships in the client bundle): the deck
// itself arrives as DeckCard props built server-side in
// lib/freeformDeck.ts.

// The deck sits pinned at top-center; cards are drawn off it and dropped
// anywhere on the tabletop. DECK_Y is its distance from the top edge (%).
export const DECK_Y = 1

// Stacking. Placed cards use a small incrementing z (last touched on top). The
// deck sits ABOVE them, so a card dropped partly over it tucks underneath
// rather than being bumped away. The in-hand (dragging) card floats above all.
export const DECK_Z = 9000
export const DRAG_Z = 100000

// On touch, the fingertip hides the small deck, so taps meant as a draw often
// land just outside it and start a background pan instead. Treat a touch within
// this many px of the deck's edges as a draw. Mouse is precise (and shows a
// cursor) so this never applies to it.
export const DECK_TOUCH_BUFFER_PX = 28

// Inline, the tabletop lives in the docs content column (max-w-3xl ≈ 768px).
// Card pixel size is `baseWPct` of that width, capped here so the wider Expand
// view keeps the SAME pixel size — the extra width becomes room to spread out,
// not bigger cards.
export const REF_MAX_PX = 768

// Zoom scales the base card width. Range/step chosen so cards stay legible at
// the small end and a handful still fit at the large end.
export const ZOOM_MIN = 0.6
export const ZOOM_MAX = 1.8
export const ZOOM_STEP = 0.2

// How long the put-back flip runs before the card returns to the pile.
// Matches the CSS `duration-500` on the flip transition.
export const PUT_BACK_MS = 500

// Positions and sizes are defined in a fixed "world" space (percentages of the
// tabletop at zoom 1). Zoom is a single CSS scale() on the content layer, so
// card sizes AND the gaps between them scale together. transform-origin is
// top-center, anchoring the deck while cards fan out — keep ZOOM_ORIGIN_X in
// sync with the CSS `transformOrigin` on the content layer.
export const ZOOM_ORIGIN_X = 0.5 // fraction of width (50%)

// The spread lives only in localStorage — no URL state, so nothing touches
// browser history. Reloads and the Expand/Close route hop both restore from
// here; Expand/Close navigate to plain, constant URLs.
export const SPREAD_KEY = 'freeform:spread'

// One card of the 78-card deck as the client needs it: enough to build
// the image URL (kind + num + slug) and localized alt text (name).
// Major slugs never match the `<num>-<suit>` form of minor slugs, so a
// slug uniquely identifies one deck. Built per locale by
// lib/freeformDeck.ts (server) and passed to FreeformClient as a prop.
export type DeckCard =
  | { slug: string; kind: 'major'; num: number; name: string }
  | { slug: string; kind: 'minor'; name: string }

// A card sitting on the tabletop. x/y are the top-left corner as a percentage
// of the tabletop; z is the stacking order (last touched rises to the top);
// revealed drives the flip (false → face-down, flips to true after landing).
export type Placed = {
  slug: string
  x: number
  y: number
  z: number
  revealed: boolean
  // Mid put-back: flipping face-down before it's removed and returned to pile.
  removing?: boolean
}

// Drop a returned card back into the pile at a random spot, so it can come up
// again later rather than always being the next draw.
export function insertRandom(
  pile: ReadonlyArray<string>,
  slug: string,
): Array<string> {
  const next = [...pile]
  next.splice(Math.floor(Math.random() * (next.length + 1)), 0, slug)
  return next
}

// Invert the pan + zoom transform: screen point → world coordinates (% of the
// unscaled tabletop), so dragging tracks the pointer at any zoom/pan.
export function toWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  zoom: number,
  panX: number,
  panY: number,
) {
  const ox = ZOOM_ORIGIN_X * rect.width
  const lx = ox + (clientX - rect.left - ox - panX) / zoom
  const ly = (clientY - rect.top - panY) / zoom // origin y = top (0)
  return { x: (lx / rect.width) * 100, y: (ly / rect.height) * 100 }
}

// The deck's box in the board's own pixel space, under a given pan+zoom. W/H are
// the board's pixel size, z the zoom, w the card width (% of board), cardAspect
// the card height/width ratio OF THE ACTIVE MAJOR STYLE (styles differ ~5%; a
// hardcoded ratio put the geometry's deck bottom above the rendered one). The
// single source of truth for where the deck is on screen — used by pan
// clamping, the touch buffer, and the hint-hiding test, so they can never
// drift apart. (transform-origin is top-center, matching the content layer's
// `scale`.)
export function deckScreenBox(
  W: number,
  H: number,
  z: number,
  w: number,
  pan: { x: number; y: number },
  cardAspect: number,
) {
  const ox = ZOOM_ORIGIN_X * W
  const leftLocal = ((100 - w) / 2 / 100) * W // deck left px @ zoom 1
  const width = z * (w / 100) * W
  return {
    left: ox + z * (leftLocal - ox) + pan.x,
    top: z * (DECK_Y / 100) * H + pan.y,
    width,
    height: width * cardAspect,
  }
}

// Spread persistence: a JSON array of {slug, x, y}, ordered bottom-to-top so
// stacking restores. Positions are rounded percentages.
export function serializeSpread(placed: ReadonlyArray<Placed>): string {
  const list = [...placed]
    .filter((p) => !p.removing)
    .sort((a, b) => a.z - b.z)
    .map((p) => ({ slug: p.slug, x: Math.round(p.x), y: Math.round(p.y) }))
  return list.length ? JSON.stringify(list) : ''
}

// Throws on malformed input (including the pre-JSON compact format) — the
// caller's try/catch treats that as "no saved spread" and starts empty.
// `validSlugs` is the deck (unknown slugs from hand-edited/corrupt storage
// are dropped). Duplicate slugs are dropped after the first occurrence: a
// dupe would collide React keys and break the pile/placed invariant.
export function parseSpread(
  str: string,
  validSlugs: ReadonlySet<string>,
): Array<Placed> {
  const data: unknown = JSON.parse(str)
  if (!Array.isArray(data)) return []
  const seen = new Set<string>()
  return data
    .filter((p): p is { slug: string; x: number; y: number } => {
      if (
        typeof p !== 'object' ||
        p === null ||
        typeof (p as { slug?: unknown }).slug !== 'string' ||
        !validSlugs.has((p as { slug: string }).slug)
      ) {
        return false
      }
      const slug = (p as { slug: string }).slug
      if (seen.has(slug)) return false
      seen.add(slug)
      return true
    })
    .map((p, i) => ({
      slug: p.slug,
      x: Number(p.x) || 0,
      y: Number(p.y) || 0,
      z: i + 1,
      revealed: true,
    }))
}
