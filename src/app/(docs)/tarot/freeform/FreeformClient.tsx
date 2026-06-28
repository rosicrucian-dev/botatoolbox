'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Tabs } from '@/components/Tabs'
import { cardBySlug, cards, thumbImage } from '@/content/data/tarot'
import { minorBySlug, minorCards, minorImage } from '@/content/data'

// Optimized card-back used for the deck top and the face-down side of the
// flip (see public/tarot/back.jpg — a thumbnail of public/files/tarot-back.jpg).
const BACK_IMAGE = '/tarot/back.jpg'

// The spread lives only in localStorage — no URL state, so nothing touches
// browser history. Reloads and the Expand/Close route hop both restore from
// here; Expand/Close navigate to plain, constant URLs.
const SPREAD_KEY = 'freeform:spread'

// The deck sits pinned at top-center; cards are drawn off it and dropped
// anywhere on the tabletop. DECK_Y is its distance from the top edge (%).
const DECK_Y = 1

// Stacking. Placed cards use a small incrementing z (last touched on top). The
// deck sits ABOVE them, so a card dropped partly over it tucks underneath
// rather than being bumped away. The in-hand (dragging) card floats above all.
const DECK_Z = 9000
const DRAG_Z = 100000

// On touch, the fingertip hides the small deck, so taps meant as a draw often
// land just outside it and start a background pan instead. Treat a touch within
// this many px of the deck's edges as a draw. Mouse is precise (and shows a
// cursor) so this never applies to it.
const DECK_TOUCH_BUFFER_PX = 28

// Inline, the tabletop lives in the docs content column (max-w-3xl ≈ 768px).
// Card pixel size is `baseWPct` of that width, capped here so the wider Expand
// view keeps the SAME pixel size — the extra width becomes room to spread out,
// not bigger cards.
const REF_MAX_PX = 768

// Zoom scales the base card width. Range/step chosen so cards stay legible at
// the small end and a handful still fit at the large end.
const ZOOM_MIN = 0.6
const ZOOM_MAX = 1.8
const ZOOM_STEP = 0.2

// Card art is 724×1200; this ratio derives a card's height from its width and
// is used throughout the geometry (deck box, drop clamping, overlap test).
const CARD_ASPECT = 1200 / 724

function ZoomInIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" strokeWidth={1.5} aria-hidden="true" {...props}>
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path
        strokeLinecap="round"
        d="m12.6 12.6 4 4M8.75 6.5v4.5M6.5 8.75h4.5"
      />
    </svg>
  )
}

function ZoomOutIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" strokeWidth={1.5} aria-hidden="true" {...props}>
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path strokeLinecap="round" d="m12.6 12.6 4 4M6.5 8.75h4.5" />
    </svg>
  )
}

// Cards are sized as a fraction of the tabletop so a spread looks the same on
// any screen. Phones get wider cards (fewer fit, but each is tappable); on
// desktop they're smaller so more fit without overlap. SSR-safe: desktop
// default, then matchMedia adjusts after mount.
function useBaseWidthPct(): number {
  const [pct, setPct] = useState(18)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const apply = () => setPct(mq.matches ? 30 : 18)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return pct
}

// Resolve a slug to either a major or minor card. Major slugs never match the
// `<num>-<suit>` form of minor slugs, so a slug uniquely identifies one deck.
type ResolvedCard =
  | { kind: 'major'; card: (typeof cards)[number] }
  | { kind: 'minor'; card: (typeof minorCards)[number] }

function resolveSlug(slug: string): ResolvedCard | null {
  const major = cardBySlug[slug]
  if (major) return { kind: 'major', card: major }
  const minor = minorBySlug[slug]
  if (minor) return { kind: 'minor', card: minor }
  return null
}

// Compact card codec (used by the spread serializer below). Majors are their
// key number (0–21); minors are rank + suit letter (Ace→A, Page→P, Knight→N,
// Queen→Q, King→K; Wands→W, Cups→C, Swords→S, Pentacles→P) — e.g. AW, 2W, PP,
// 10S. The suit is always the trailing letter, so the split is unambiguous; a
// bare number is a major.
const SUIT_LETTER: Record<string, string> = {
  Wands: 'W', Cups: 'C', Swords: 'S', Pentacles: 'P',
}
const LETTER_SUIT: Record<string, string> = {
  W: 'Wands', C: 'Cups', S: 'Swords', P: 'Pentacles',
}
const RANK_ABBR: Record<string, string> = {
  Ace: 'A', Page: 'P', Knight: 'N', Queen: 'Q', King: 'K',
}
const ABBR_RANK: Record<string, string> = {
  A: 'Ace', P: 'Page', N: 'Knight', Q: 'Queen', K: 'King',
}

function encodeCard(slug: string): string {
  const found = resolveSlug(slug)
  if (!found) return ''
  if (found.kind === 'major') return String(found.card.num)
  const rank = RANK_ABBR[found.card.num] ?? found.card.num
  return rank + (SUIT_LETTER[found.card.suit] ?? '')
}

function decodeCard(token: string): string | null {
  if (/^\d+$/.test(token)) {
    const card = cards.find((c) => c.num === Number(token))
    return card ? card.slug : null
  }
  const suit = LETTER_SUIT[token.slice(-1)]
  const rankAbbr = token.slice(0, -1)
  if (!suit || !rankAbbr) return null
  const rank = ABBR_RANK[rankAbbr] ?? rankAbbr
  const slug = `${rank.toLowerCase()}-${suit.toLowerCase()}`
  return minorBySlug[slug] ? slug : null
}

// A card sitting on the tabletop. x/y are the top-left corner as a percentage
// of the tabletop; z is the stacking order (last touched rises to the top);
// revealed drives the flip (false → face-down, flips to true after landing).
type Placed = {
  slug: string
  x: number
  y: number
  z: number
  revealed: boolean
  // Mid put-back: flipping face-down before it's removed and returned to pile.
  removing?: boolean
}

// The card currently under the pointer. fromDeck distinguishes a fresh draw
// (face-down, will flip on drop) from rearranging a card already on the table.
type DragState = {
  slug: string
  fromDeck: boolean
  pointerId: number
  // Offset of the pointer from the card's top-left, in world units (% of the
  // tabletop), so the card tracks the pointer regardless of zoom.
  grabX: number
  grabY: number
  startClientX: number
  startClientY: number
  x: number
  y: number
}

// The full 78-card deck. Freeform always uses the whole deck.
const FULL_DECK = [...cards.map((c) => c.slug), ...minorCards.map((c) => c.slug)]

function shuffle(input: Array<string>): Array<string> {
  const a = [...input]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Drop a returned card back into the pile at a random spot, so it can come up
// again later rather than always being the next draw.
function insertRandom(pile: Array<string>, slug: string): Array<string> {
  const next = [...pile]
  next.splice(Math.floor(Math.random() * (next.length + 1)), 0, slug)
  return next
}

// Positions and sizes are defined in a fixed "world" space (percentages of the
// tabletop at zoom 1). Zoom is a single CSS scale() on the content layer, so
// card sizes AND the gaps between them scale together. transform-origin is
// top-center, anchoring the deck while cards fan out — keep ZOOM_ORIGIN in sync
// with the CSS `transformOrigin` below.
const ZOOM_ORIGIN_X = 0.5 // fraction of width (50%)

// Invert the pan + zoom transform: screen point → world coordinates (% of the
// unscaled tabletop), so dragging tracks the pointer at any zoom/pan.
function toWorld(
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
// the board's pixel size, z the zoom, w the card width (% of board). The single
// source of truth for where the deck is on screen — used by pan clamping, the
// touch buffer, and the hint-hiding test, so they can never drift apart.
// (transform-origin is top-center, matching the content layer's `scale`.)
function deckScreenBox(
  W: number,
  H: number,
  z: number,
  w: number,
  pan: { x: number; y: number },
) {
  const ox = ZOOM_ORIGIN_X * W
  const leftLocal = ((100 - w) / 2 / 100) * W // deck left px @ zoom 1
  const width = z * (w / 100) * W
  return {
    left: ox + z * (leftLocal - ox) + pan.x,
    top: z * (DECK_Y / 100) * H + pan.y,
    width,
    height: width * CARD_ASPECT,
  }
}

// Compact spread codec (stored in localStorage): `12@33,40;AW@50,55` — one
// token@x,y per card, ordered bottom-to-top so stacking restores. Positions are
// rounded percentages.
function serialize(placed: Array<Placed>): string {
  return [...placed]
    .filter((p) => !p.removing)
    .sort((a, b) => a.z - b.z)
    .map((p) => `${encodeCard(p.slug)}@${Math.round(p.x)},${Math.round(p.y)}`)
    .filter((s) => !s.startsWith('@'))
    .join(';')
}

function parse(str: string): Array<Placed> {
  return str
    .split(';')
    .filter(Boolean)
    .map((tok, i): Placed | null => {
      const at = tok.indexOf('@')
      if (at < 0) return null
      const slug = decodeCard(tok.slice(0, at))
      const [xs, ys] = tok.slice(at + 1).split(',')
      if (!slug) return null
      return {
        slug,
        x: Number(xs) || 0,
        y: Number(ys) || 0,
        z: i + 1,
        revealed: true,
      }
    })
    .filter((p): p is Placed => p !== null)
}

// One card's face, sized to fill its absolutely-positioned wrapper. Majors use
// the 362w thumbnail (~⅓ the bytes of the full image); minors use the colored
// set, which is already thumbnail-sized (~270w), so it has no separate thumb.
// Minors are stretched to the major proportion (see the minor-arcana note).
function CardFace({ slug }: { slug: string }) {
  const found = resolveSlug(slug)
  if (!found) return null
  if (found.kind === 'major') {
    return (
      <img
        src={thumbImage(found.card)}
        alt={found.card.name}
        width={724}
        height={1200}
        draggable={false}
        className="aspect-[724/1200] w-full rounded-md object-cover shadow-lg"
      />
    )
  }
  return (
    <img
      src={minorImage(found.card)}
      alt={`${found.card.num} of ${found.card.suit}`}
      draggable={false}
      // CSS aspect-ratio forces the major proportion; object-fill stretches
      // the minor pixels to fill it (nothing cropped) at ~4% vertical squash.
      className="aspect-[724/1200] w-full rounded-md object-fill shadow-lg"
    />
  )
}

export function FreeformClient({
  variant = 'inline',
}: {
  variant?: 'inline' | 'expand'
} = {}) {
  const router = useRouter()
  const baseWPct = useBaseWidthPct()
  const [zoom, setZoom] = useState(1)
  const [tableW, setTableW] = useState(0)
  const [tableH, setTableH] = useState(0)
  // Card width as a % of the current table, but sized from the capped reference
  // width so cards are the same pixel size inline and in Expand (the wider
  // Expand table just yields a smaller %, i.e. more room). Zoom is applied
  // separately to the whole content layer via scale() (see the board markup).
  const cardWPct =
    tableW > 0 ? baseWPct * (Math.min(tableW, REF_MAX_PX) / tableW) : baseWPct
  const deckXPct = (100 - cardWPct) / 2

  // The spread is local-only: it starts empty for SSR/hydration, then the mount
  // effect restores the last spread from localStorage. The draw pile is filled
  // client-side (shuffled) by that same effect.
  const [placed, setPlaced] = useState<Array<Placed>>([])
  const [pile, setPile] = useState<Array<string>>([])
  const [drag, setDrag] = useState<DragState | null>(null)
  // Pan offset (screen px) of the whole content layer. Dragging the empty
  // background moves it, clamped so the deck never leaves the view.
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // The hint lives in the lower half of the board. Once the space is panned far
  // enough down that the deck descends past the board's vertical midline, the
  // deck would overlap the hint — so hide it.
  const deckBox = deckScreenBox(tableW, tableH, zoom, cardWPct, pan)
  const deckInLowerHalf = tableH > 0 && deckBox.top + deckBox.height > tableH / 2

  const tableRef = useRef<HTMLDivElement | null>(null)
  const topZ = useRef(placed.length)
  // Refs mirror state so the window-level pointer listeners (bound once) always
  // read current values without re-binding on every move.
  const dragRef = useRef<DragState | null>(null)
  const pileRef = useRef(pile)
  const cardWRef = useRef(cardWPct)
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  // The active background-pan gesture (null when not panning).
  const panGestureRef = useRef<{
    pointerId: number
    startClientX: number
    startClientY: number
    startPanX: number
    startPanY: number
  } | null>(null)
  // True once a gesture moves past the tap threshold. Persists through the
  // trailing click so a drag-to-rearrange doesn't also follow the card's link.
  const movedRef = useRef(false)
  dragRef.current = drag
  pileRef.current = pile
  cardWRef.current = cardWPct
  zoomRef.current = zoom
  panRef.current = pan

  // Track the table's pixel width so card sizing can reference the capped
  // width (REF_MAX_PX) — see cardWPct above.
  useEffect(() => {
    const el = tableRef.current
    if (!el) return
    const update = () => {
      setTableW(el.clientWidth)
      setTableH(el.clientHeight)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // On mount: restore the last spread from localStorage (this is how reloads
  // and the Expand/Close route hop both carry state), then shuffle the rest of
  // the deck into the pile. Doing both here keeps pile and table in sync —
  // restored cards never reappear in the draw pile.
  useEffect(() => {
    let initial: Array<Placed> = []
    try {
      const stored = localStorage.getItem(SPREAD_KEY)
      const restored = stored ? parse(stored) : []
      if (restored.length) {
        initial = restored
        topZ.current = restored.length
        setPlaced(restored)
      }
    } catch {}
    const have = new Set(initial.map((p) => p.slug))
    setPile(shuffle(FULL_DECK.filter((s) => !have.has(s))))
  }, [])

  // The spread's single source of truth: persist it to localStorage on every
  // change. No URL involvement, so nothing touches browser history.
  useEffect(() => {
    try {
      const s = serialize(placed)
      if (s) localStorage.setItem(SPREAD_KEY, s)
      else localStorage.removeItem(SPREAD_KEY)
    } catch {}
  }, [placed])

  // Flip freshly-dropped cards face-up a beat after they land, so the
  // face-down frame paints first and the CSS flip actually animates.
  useEffect(() => {
    if (!placed.some((p) => !p.revealed && !p.removing)) return
    const t = setTimeout(() => {
      setPlaced((prev) =>
        prev.map((p) =>
          p.revealed || p.removing ? p : { ...p, revealed: true },
        ),
      )
    }, 30)
    return () => clearTimeout(t)
  }, [placed])

  // Full-screen (expand) chrome: a body-scroll lock and Esc-to-close. Unlike
  // the dark slide players, Freeform expand is theme-colored (it's just a
  // full-bleed version of the docs page), so there's no black toolbar-tint
  // prime. All no-ops in the inline variant.
  useEffect(() => {
    if (variant !== 'expand') return
    window.scrollTo(0, 0)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [variant])

  useEffect(() => {
    if (variant !== 'expand') return
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement ||
        t?.isContentEditable
      )
        return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (e.key === 'Escape') router.push('/tarot/freeform')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [variant, router])

  // Fraction of the dropped card's area that lies over the deck. More than half
  // → the user is putting it back on the deck (placement cancelled). Half or
  // less → it's placed where dropped, tucked under the deck.
  const mostlyOnDeck = useCallback((x: number, y: number, rect: DOMRect) => {
    const w = cardWRef.current
    const hPct = (((w / 100) * rect.width * CARD_ASPECT) / rect.height) * 100
    const dx = (100 - w) / 2
    const iw = Math.max(0, Math.min(x + w, dx + w) - Math.max(x, dx))
    const ih = Math.max(0, Math.min(y + hPct, DECK_Y + hPct) - Math.max(y, DECK_Y))
    return (iw * ih) / (w * hPct) > 0.5
  }, [])

  // Clamp a dropped card (world coords) so it keeps ≥40% within the CURRENTLY
  // VISIBLE area — i.e. wherever you can see under the current pan+zoom, you can
  // drop. The world itself is unbounded; the only constraint is "don't leave it
  // off the visible edge." Computed by mapping the on-screen limits back through
  // the inverse pan+zoom transform (the same one toWorld uses).
  const clampToView = useCallback((x: number, y: number, rect: DOMRect) => {
    const w = cardWRef.current
    const z = zoomRef.current
    const pan = panRef.current
    const W = rect.width
    const H = rect.height
    const ox = ZOOM_ORIGIN_X * W
    const wScreen = z * (w / 100) * W
    const hScreen = wScreen * CARD_ASPECT
    // Screen-space bounds for the card's top-left to keep ≥40% on-screen.
    const toWorldX = (sx: number) => ((ox + (sx - ox - pan.x) / z) / W) * 100
    const toWorldY = (sy: number) => (((sy - pan.y) / z) / H) * 100
    const xA = toWorldX(-0.6 * wScreen)
    const xB = toWorldX(W - 0.4 * wScreen)
    const yA = toWorldY(-0.6 * hScreen)
    const yB = toWorldY(H - 0.4 * hScreen)
    return {
      x: Math.min(Math.max(x, Math.min(xA, xB)), Math.max(xA, xB)),
      y: Math.min(Math.max(y, Math.min(yA, yB)), Math.max(yA, yB)),
    }
  }, [])

  // Constrain pan so the deck stays fully on-screen — it's the anchor/boundary
  // of the space. Computes the deck's screen box under the current pan+zoom and
  // limits pan to keep that box inside the tabletop.
  const clampPan = useCallback((nx: number, ny: number, rect: DOMRect) => {
    // Deck box at pan 0; pan is bounded so the box stays inside the board.
    const box = deckScreenBox(rect.width, rect.height, zoomRef.current, cardWRef.current, { x: 0, y: 0 })
    const minX = -box.left
    const maxX = rect.width - box.width - box.left
    const minY = -box.top
    const maxY = rect.height - box.height - box.top
    return {
      x: Math.min(Math.max(nx, Math.min(minX, maxX)), Math.max(minX, maxX)),
      y: Math.min(Math.max(ny, Math.min(minY, maxY)), Math.max(minY, maxY)),
    }
  }, [])

  // Re-clamp pan whenever zoom changes (the deck box moves), so the deck can't
  // be left stranded off-screen by zooming.
  useEffect(() => {
    const rect = tableRef.current?.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return
    setPan((p) => clampPan(p.x, p.y, rect))
  }, [zoom, clampPan])

  // Window-level pointer handling, bound once. Reads everything from refs so it
  // never goes stale; pointer capture isn't needed because nothing else listens
  // and the draggables set touch-action:none to suppress scrolling.
  useEffect(() => {
    function move(e: PointerEvent) {
      const pg = panGestureRef.current
      if (pg && e.pointerId === pg.pointerId) {
        const rect = tableRef.current?.getBoundingClientRect()
        if (!rect || !rect.width || !rect.height) return
        const nx = pg.startPanX + (e.clientX - pg.startClientX)
        const ny = pg.startPanY + (e.clientY - pg.startClientY)
        setPan(clampPan(nx, ny, rect))
        return
      }
      const d = dragRef.current
      if (!d || e.pointerId !== d.pointerId) return
      const rect = tableRef.current?.getBoundingClientRect()
      if (!rect || !rect.width || !rect.height) return
      if (
        Math.hypot(e.clientX - d.startClientX, e.clientY - d.startClientY) > 6
      ) {
        movedRef.current = true
      }
      const pan = panRef.current
      const p = toWorld(e.clientX, e.clientY, rect, zoomRef.current, pan.x, pan.y)
      const x = p.x - d.grabX
      const y = p.y - d.grabY
      setDrag((cur) => (cur ? { ...cur, x, y } : cur))
    }
    function up(e: PointerEvent) {
      if (panGestureRef.current?.pointerId === e.pointerId) {
        panGestureRef.current = null
        return
      }
      const d = dragRef.current
      if (!d || e.pointerId !== d.pointerId) return
      const measured = tableRef.current?.getBoundingClientRect()
      // Treat a zero-size rect (not yet laid out) as missing — the null-checks
      // below then fall back to the raw drop coords instead of dividing by 0.
      const rect = measured && measured.width && measured.height ? measured : null
      // Dropped mostly on the deck → put the card back. A fresh draw is simply
      // not placed (it's still on top of the deck); a card already on the table
      // is removed and shuffled back into the pile.
      if (rect && mostlyOnDeck(d.x, d.y, rect)) {
        if (!d.fromDeck) {
          // Reverse-flip the card face-down at the deck, then return it to the
          // pile once the flip finishes. (A fresh draw is already face-down, so
          // it just stays on the deck — nothing to animate.)
          const slug = d.slug
          setPlaced((prev) =>
            prev.map((c) =>
              c.slug === slug
                ? { ...c, x: d.x, y: d.y, revealed: false, removing: true }
                : c,
            ),
          )
          setTimeout(() => {
            setPlaced((prev) => prev.filter((c) => c.slug !== slug))
            setPile((prev) => insertRandom(prev, slug))
          }, 480)
        }
        setDrag(null)
        return
      }
      const pos = rect ? clampToView(d.x, d.y, rect) : { x: d.x, y: d.y }
      if (d.fromDeck) {
        topZ.current += 1
        const z = topZ.current
        setPlaced((prev) => [
          ...prev,
          { slug: d.slug, x: pos.x, y: pos.y, z, revealed: false },
        ])
        setPile((prev) => prev.filter((s) => s !== d.slug))
      } else {
        setPlaced((prev) =>
          prev.map((c) =>
            c.slug === d.slug ? { ...c, x: pos.x, y: pos.y } : c,
          ),
        )
      }
      setDrag(null)
    }
    function cancel(e: PointerEvent) {
      if (panGestureRef.current?.pointerId === e.pointerId) {
        panGestureRef.current = null
        return
      }
      const d = dragRef.current
      if (!d || e.pointerId !== d.pointerId) return
      setDrag(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
    }
  }, [mostlyOnDeck, clampToView, clampPan])

  function beginDrag(
    e: React.PointerEvent,
    slug: string,
    fromDeck: boolean,
    startX: number,
    startY: number,
  ) {
    const rect = tableRef.current?.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return
    const pan = panRef.current
    const p = toWorld(e.clientX, e.clientY, rect, zoomRef.current, pan.x, pan.y)
    movedRef.current = false
    setDrag({
      slug,
      fromDeck,
      pointerId: e.pointerId,
      grabX: p.x - startX,
      grabY: p.y - startY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      x: startX,
      y: startY,
    })
  }

  // Is a screen point within the deck's box, grown by the touch buffer? Uses the
  // same deck-screen-box math as clampPan (transform-origin top-center).
  function nearDeck(clientX: number, clientY: number) {
    const rect = tableRef.current?.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return false
    const box = deckScreenBox(rect.width, rect.height, zoomRef.current, cardWRef.current, panRef.current)
    // box is board-relative; shift into client coords and grow by the buffer.
    const left = rect.left + box.left
    const top = rect.top + box.top
    const b = DECK_TOUCH_BUFFER_PX
    return (
      clientX >= left - b &&
      clientX <= left + box.width + b &&
      clientY >= top - b &&
      clientY <= top + box.height + b
    )
  }

  // Pan starts only on the bare background; card/deck pointerdowns stop
  // propagation so they don't also begin a pan. On touch, a near-miss around the
  // deck is treated as a draw rather than a pan (see DECK_TOUCH_BUFFER_PX).
  function startPan(e: React.PointerEvent) {
    if (
      e.pointerType !== 'mouse' &&
      pileRef.current.length > 0 &&
      nearDeck(e.clientX, e.clientY)
    ) {
      beginDrag(e, pileRef.current[0], true, deckXPct, DECK_Y)
      return
    }
    panGestureRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
    }
  }

  function startDeckDrag(e: React.PointerEvent) {
    e.stopPropagation()
    if (pileRef.current.length === 0) return
    beginDrag(e, pileRef.current[0], true, deckXPct, DECK_Y)
  }

  function startCardDrag(e: React.PointerEvent, p: Placed) {
    e.stopPropagation()
    topZ.current += 1
    const z = topZ.current
    setPlaced((prev) => prev.map((c) => (c.slug === p.slug ? { ...c, z } : c)))
    beginDrag(e, p.slug, false, p.x, p.y)
  }

  function reshuffle() {
    setPlaced([])
    topZ.current = 0
    setPile(shuffle(FULL_DECK))
  }

  const draggingExisting = drag && !drag.fromDeck ? drag.slug : null
  const zoomBtn =
    'inline-flex h-full items-center justify-center px-3 transition hover:bg-current/10 disabled:opacity-40 disabled:hover:bg-transparent'

  // Expand/Close are plain, constant URLs — the spread crosses the route
  // boundary via localStorage, so the only history entries are these two fixed
  // paths (the browser dedupes them).
  const expandHref = '/tarot/freeform/expand'
  const closeHref = '/tarot/freeform'

  // Zoom + Shuffle — shared between the inline header row and the expand header.
  // Shuffle sits to the LEFT of the zoom buttons: since the control group is
  // right-anchored, it grows leftward when it appears and never nudges the
  // zoom (or Expand) buttons.
  const controls = (
    <>
      {placed.length > 0 && (
        <Tabs>
          <button
            type="button"
            onClick={reshuffle}
            className="inline-flex h-full items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition hover:bg-current/10"
          >
            Shuffle
          </button>
        </Tabs>
      )}
      <Tabs>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= ZOOM_MIN + 1e-9}
          onClick={() =>
            setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))
          }
          className={zoomBtn}
        >
          <ZoomOutIcon className="h-5 w-5 stroke-current" />
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= ZOOM_MAX - 1e-9}
          onClick={() =>
            setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
          }
          className={zoomBtn}
        >
          <ZoomInIcon className="h-5 w-5 stroke-current" />
        </button>
      </Tabs>
    </>
  )

  // The tabletop. Cards are absolutely positioned by percentage; the deck is
  // pinned top-center. overflow-hidden clips any card hung past an edge (≥40%
  // always stays visible, so it's grabbable). Inline it's a bordered card;
  // expanded it fills the themed full-screen shell.
  const board = (
    <div
      ref={tableRef}
      onPointerDown={startPan}
      className={
        variant === 'expand'
          ? 'relative h-full w-full cursor-grab touch-none overflow-hidden bg-zinc-50 dark:bg-zinc-800/40'
          : 'relative h-[calc(100svh-12rem)] w-full cursor-grab touch-none overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40'
      }
    >
      {/* Content layer — pan translates it (drag the bare background); zoom
          scales sizes and spacing together, anchored at the deck (top-center).
          Keep transformOrigin in sync with ZOOM_ORIGIN_X. */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '50% 0%',
          touchAction: 'none',
        }}
      >
        {/* Deck */}
        <button
          type="button"
          onPointerDown={startDeckDrag}
          onClick={() => {
            if (pile.length === 0) reshuffle()
          }}
          aria-label={pile.length > 0 ? 'Draw a card' : 'Reshuffle'}
          className="absolute block select-none transition active:scale-95"
          style={{
            left: `${deckXPct}%`,
            top: `${DECK_Y}%`,
            width: `${cardWPct}%`,
            touchAction: 'none',
            zIndex: DECK_Z,
          }}
        >
          {pile.length > 0 ? (
            <img
              src={BACK_IMAGE}
              alt=""
              draggable={false}
              className="aspect-[724/1200] w-full rounded-md object-cover shadow-xl"
            />
          ) : (
            <span className="block aspect-[724/1200] w-full rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-600" />
          )}
        </button>

        {/* Placed cards. The one being rearranged rides the cursor (positioned
            from the live drag state) but stays the same element, so a tap still
            follows its link and a drag does not. */}
        {placed.map((p) => {
          const isDragging = draggingExisting === p.slug
          const x = isDragging ? drag!.x : p.x
          const y = isDragging ? drag!.y : p.y
          return (
            <Link
              key={p.slug}
              href={`/tarot/${p.slug}`}
              draggable={false}
              onPointerDown={(e) => startCardDrag(e, p)}
              onClick={(e) => {
                // The pointerup that ends a drag also fires a click; suppress
                // it so only a genuine tap follows the link.
                if (movedRef.current) e.preventDefault()
              }}
              className={`absolute block select-none ${isDragging ? 'scale-[1.04]' : ''} ${p.removing ? 'pointer-events-none' : ''}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${cardWPct}%`,
                zIndex: isDragging || p.removing ? DRAG_Z : p.z,
                touchAction: 'none',
                perspective: '1000px',
              }}
            >
              <span
                className="relative block transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: p.revealed ? 'rotateY(0deg)' : 'rotateY(180deg)',
                }}
              >
                <span className="block" style={{ backfaceVisibility: 'hidden' }}>
                  <CardFace slug={p.slug} />
                </span>
                <img
                  src={BACK_IMAGE}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 aspect-[724/1200] w-full rounded-md object-cover shadow-lg"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                />
              </span>
            </Link>
          )
        })}

        {/* A fresh draw rides the cursor face-down until it lands and flips. */}
        {drag?.fromDeck && (
          <div
            className="pointer-events-none absolute scale-[1.04]"
            style={{
              left: `${drag.x}%`,
              top: `${drag.y}%`,
              width: `${cardWPct}%`,
              zIndex: DRAG_Z,
            }}
          >
            <img
              src={BACK_IMAGE}
              alt=""
              draggable={false}
              className="aspect-[724/1200] w-full rounded-md object-cover shadow-2xl"
            />
          </div>
        )}

      </div>

      {placed.length === 0 && !drag && !deckInLowerHalf && (
        // Centered within the lower half of the content area. Hidden as soon as
        // a drag starts so it doesn't paint over the first card being drawn, and
        // when the deck has been panned down into the lower half (would overlap).
        <div className="pointer-events-none absolute inset-x-0 top-1/2 bottom-0 flex items-center justify-center px-6">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Take a deep breath, set an intention, and pull a card by dragging from the top of the deck.
          </p>
        </div>
      )}
      </div>
  )

  if (variant === 'expand') {
    return (
      <div
        className="fixed inset-x-0 top-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
        style={{
          height: '100svh',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Themed header, matching the docs header (color + bottom divider). */}
        <header className="relative z-10 flex h-14 shrink-0 items-center justify-between gap-4 bg-white px-4 sm:px-6 lg:px-8 dark:bg-zinc-900">
          <span className="truncate text-base font-semibold">Freeform</span>
          <div className="flex items-center gap-3">
            {controls}
            <button
              type="button"
              onClick={() => router.push(closeHref)}
              aria-label="Close"
              className="flex size-9 items-center justify-center rounded-md transition hover:bg-zinc-900/5 dark:hover:bg-white/5"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <div className="absolute inset-x-0 top-full h-px bg-zinc-900/7.5 dark:bg-white/7.5" />
        </header>
        <div className="min-h-0 flex-1">{board}</div>
      </div>
    )
  }

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          <span className="md:hidden"></span>
          <span className="hidden md:inline">Freeform</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-zinc-900 dark:text-white">
          {controls}
          <Link
            href={expandHref}
            aria-label="Expand"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-emerald-500 px-3 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400"
          >
            Expand ⤢
          </Link>
        </div>
      </div>
      {board}
    </article>
  )
}
