'use client'

// All Freeform tabletop state and gestures: the placed spread, draw pile,
// drag/pan/zoom, persistence, and the window-level pointer machinery.
// FreeformClient renders what this returns. Geometry + persistence live
// in @/lib/freeform.
//
// One deliberate piece of cleverness, contained here: several refs mirror
// state (drag, pile, cardWPct, zoom, pan, cardAspect) so the window
// pointer listeners — bound once — always read current values without
// re-binding on every move. Don't read those refs during render; they
// exist for the listeners.

import { useCallback, useEffect, useRef, useState } from 'react'

import { majorAspectRatio } from '@/content/data'
import {
  DECK_TOUCH_BUFFER_PX,
  DECK_Y,
  FULL_DECK,
  PUT_BACK_MS,
  REF_MAX_PX,
  SPREAD_KEY,
  deckScreenBox,
  insertRandom,
  parseSpread,
  serializeSpread,
  toWorld,
  type Placed,
} from '@/lib/freeform'
import { shuffle } from '@/lib/shuffle'
import { useTarotStyle } from '@/lib/tarotStyle'

// The card currently under the pointer. fromDeck distinguishes a fresh draw
// (face-down, will flip on drop) from rearranging a card already on the table.
export type DragState = {
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

export function useFreeformSpread() {
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

  // Height/width ratio of the ACTIVE major style — the geometry (deck box,
  // drop clamping, overlap test) must match what's actually rendered; the
  // styles differ by ~5%. (The registry stores width/height for CSS
  // `aspect-ratio`, hence the inversion.)
  const { majorStyle } = useTarotStyle()
  const cardAspect = 1 / majorAspectRatio(majorStyle)

  // The spread is local-only: it starts empty for SSR/hydration, then the mount
  // effect restores the last spread from localStorage. The draw pile is filled
  // client-side (shuffled) by that same effect.
  const [placed, setPlaced] = useState<Array<Placed>>([])
  const [pile, setPile] = useState<Array<string>>([])
  const [drag, setDrag] = useState<DragState | null>(null)
  // Pan offset (screen px) of the whole content layer. Dragging the empty
  // background moves it, clamped so the deck never leaves the view.
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const tableRef = useRef<HTMLDivElement | null>(null)
  const topZ = useRef(placed.length)
  // Refs mirror state for the window-level pointer listeners — see the
  // header comment.
  const dragRef = useRef<DragState | null>(null)
  const pileRef = useRef(pile)
  const cardWRef = useRef(cardWPct)
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  const cardAspectRef = useRef(cardAspect)
  // The board's rect, measured once per gesture (it can't move during one:
  // touch scrolling is suppressed by touch-action, and pan moves the inner
  // layer, not the board). Re-reading it per pointermove forced a
  // read-after-write reflow every frame. Drops re-measure on release.
  const gestureRectRef = useRef<DOMRect | null>(null)
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
  cardAspectRef.current = cardAspect

  // Track the table's pixel size so card sizing can reference the capped
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
      const restored = stored ? parseSpread(stored) : []
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
      const s = serializeSpread(placed)
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

  // Finalize put-backs: once a card's face-down flip has run, remove it from
  // the table and return it to the pile. An effect with cleanup — NOT a bare
  // timeout — so a reshuffle or unmount mid-flip cancels the pending return
  // (a bare timeout could re-insert into a freshly reshuffled full pile, or
  // fire after unmount). The closure's `placed` is always the render that
  // scheduled this run, so the slug list can't be stale.
  useEffect(() => {
    if (!placed.some((p) => p.removing)) return
    const returning = placed.filter((p) => p.removing).map((p) => p.slug)
    const t = setTimeout(() => {
      setPlaced((prev) => prev.filter((c) => !c.removing))
      setPile((prev) =>
        returning.reduce((acc, s) => insertRandom(acc, s), prev),
      )
    }, PUT_BACK_MS)
    return () => clearTimeout(t)
  }, [placed])

  // Fraction of the dropped card's area that lies over the deck. More than half
  // → the user is putting it back on the deck (placement cancelled). Half or
  // less → it's placed where dropped, tucked under the deck.
  const mostlyOnDeck = useCallback((x: number, y: number, rect: DOMRect) => {
    const w = cardWRef.current
    const hPct =
      (((w / 100) * rect.width * cardAspectRef.current) / rect.height) * 100
    const dx = (100 - w) / 2
    const iw = Math.max(0, Math.min(x + w, dx + w) - Math.max(x, dx))
    const ih = Math.max(
      0,
      Math.min(y + hPct, DECK_Y + hPct) - Math.max(y, DECK_Y),
    )
    return (iw * ih) / (w * hPct) > 0.5
  }, [])

  // Clamp a dropped card (world coords) so it keeps ≥40% within the CURRENTLY
  // VISIBLE area — i.e. wherever you can see under the current pan+zoom, you can
  // drop. The world itself is unbounded; the only constraint is "don't leave it
  // off the visible edge." Computed by mapping the on-screen limits through the
  // same inverse transform (toWorld) the drag tracking uses.
  const clampToView = useCallback((x: number, y: number, rect: DOMRect) => {
    const z = zoomRef.current
    const pan = panRef.current
    const wScreen = z * (cardWRef.current / 100) * rect.width
    const hScreen = wScreen * cardAspectRef.current
    // Screen-space limits for the card's top-left (≥40% on-screen), mapped to
    // world coords. toWorld takes client coords, so offset by the rect origin.
    const a = toWorld(
      rect.left - 0.6 * wScreen,
      rect.top - 0.6 * hScreen,
      rect,
      z,
      pan.x,
      pan.y,
    )
    const b = toWorld(
      rect.left + rect.width - 0.4 * wScreen,
      rect.top + rect.height - 0.4 * hScreen,
      rect,
      z,
      pan.x,
      pan.y,
    )
    return {
      x: Math.min(Math.max(x, Math.min(a.x, b.x)), Math.max(a.x, b.x)),
      y: Math.min(Math.max(y, Math.min(a.y, b.y)), Math.max(a.y, b.y)),
    }
  }, [])

  // Constrain pan so the deck stays fully on-screen — it's the anchor/boundary
  // of the space. Computes the deck's screen box under the current pan+zoom and
  // limits pan to keep that box inside the tabletop.
  const clampPan = useCallback((nx: number, ny: number, rect: DOMRect) => {
    // Deck box at pan 0; pan is bounded so the box stays inside the board.
    const box = deckScreenBox(
      rect.width,
      rect.height,
      zoomRef.current,
      cardWRef.current,
      { x: 0, y: 0 },
      cardAspectRef.current,
    )
    const minX = -box.left
    const maxX = rect.width - box.width - box.left
    const minY = -box.top
    const maxY = rect.height - box.height - box.top
    return {
      x: Math.min(Math.max(nx, Math.min(minX, maxX)), Math.max(minX, maxX)),
      y: Math.min(Math.max(ny, Math.min(minY, maxY)), Math.max(minY, maxY)),
    }
  }, [])

  // Re-clamp pan whenever zoom or the card geometry changes (the deck box
  // moves), so the deck can't be left stranded off-screen.
  useEffect(() => {
    const rect = tableRef.current?.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return
    setPan((p) => clampPan(p.x, p.y, rect))
  }, [zoom, cardAspect, clampPan])

  // Window-level pointer handling, bound once. Reads everything from refs so it
  // never goes stale; pointer capture isn't needed because nothing else listens
  // and the draggables set touch-action:none to suppress scrolling.
  useEffect(() => {
    function move(e: PointerEvent) {
      const rect = gestureRectRef.current
      const pg = panGestureRef.current
      if (pg && e.pointerId === pg.pointerId) {
        if (!rect || !rect.width || !rect.height) return
        const nx = pg.startPanX + (e.clientX - pg.startClientX)
        const ny = pg.startPanY + (e.clientY - pg.startClientY)
        setPan(clampPan(nx, ny, rect))
        return
      }
      const d = dragRef.current
      if (!d || e.pointerId !== d.pointerId) return
      if (!rect || !rect.width || !rect.height) return
      if (
        Math.hypot(e.clientX - d.startClientX, e.clientY - d.startClientY) > 6
      ) {
        movedRef.current = true
      }
      const pan = panRef.current
      const p = toWorld(
        e.clientX,
        e.clientY,
        rect,
        zoomRef.current,
        pan.x,
        pan.y,
      )
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
      // Fresh measurement for the drop itself — cheap once per gesture, and
      // correct even if the page scrolled under a mouse drag.
      const measured = tableRef.current?.getBoundingClientRect()
      // Treat a zero-size rect (not yet laid out) as missing — the null-checks
      // below then fall back to the raw drop coords instead of dividing by 0.
      const rect =
        measured && measured.width && measured.height ? measured : null
      // Dropped mostly on the deck → put the card back. A fresh draw is simply
      // not placed (it's still on top of the deck); a card already on the table
      // is removed and shuffled back into the pile.
      if (rect && mostlyOnDeck(d.x, d.y, rect)) {
        if (!d.fromDeck) {
          // Reverse-flip the card face-down at the deck; the put-back effect
          // above returns it to the pile once the flip finishes. (A fresh draw
          // is already face-down, so it just stays on the deck — nothing to
          // animate.)
          const slug = d.slug
          setPlaced((prev) =>
            prev.map((c) =>
              c.slug === slug
                ? { ...c, x: d.x, y: d.y, revealed: false, removing: true }
                : c,
            ),
          )
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

  const beginDrag = useCallback(
    (
      e: React.PointerEvent,
      slug: string,
      fromDeck: boolean,
      startX: number,
      startY: number,
    ) => {
      const rect = tableRef.current?.getBoundingClientRect()
      if (!rect || !rect.width || !rect.height) return
      gestureRectRef.current = rect
      const pan = panRef.current
      const p = toWorld(
        e.clientX,
        e.clientY,
        rect,
        zoomRef.current,
        pan.x,
        pan.y,
      )
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
    },
    [],
  )

  // Is a screen point within the deck's box, grown by the touch buffer? Uses the
  // same deck-screen-box math as clampPan (transform-origin top-center).
  const nearDeck = useCallback((clientX: number, clientY: number) => {
    const rect = tableRef.current?.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return false
    const box = deckScreenBox(
      rect.width,
      rect.height,
      zoomRef.current,
      cardWRef.current,
      panRef.current,
      cardAspectRef.current,
    )
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
  }, [])

  // Pan starts only on the bare background; card/deck pointerdowns stop
  // propagation so they don't also begin a pan. On touch, a near-miss around the
  // deck is treated as a draw rather than a pan (see DECK_TOUCH_BUFFER_PX).
  const startPan = useCallback(
    (e: React.PointerEvent) => {
      if (
        e.pointerType !== 'mouse' &&
        pileRef.current.length > 0 &&
        nearDeck(e.clientX, e.clientY)
      ) {
        // deckXPct is derivable from the ref'd card width — recompute so this
        // callback stays stable for memoized children.
        beginDrag(
          e,
          pileRef.current[0],
          true,
          (100 - cardWRef.current) / 2,
          DECK_Y,
        )
        return
      }
      const rect = tableRef.current?.getBoundingClientRect()
      if (!rect || !rect.width || !rect.height) return
      gestureRectRef.current = rect
      panGestureRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPanX: panRef.current.x,
        startPanY: panRef.current.y,
      }
    },
    [beginDrag, nearDeck],
  )

  const startDeckDrag = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      if (pileRef.current.length === 0) return
      beginDrag(
        e,
        pileRef.current[0],
        true,
        (100 - cardWRef.current) / 2,
        DECK_Y,
      )
    },
    [beginDrag],
  )

  const startCardDrag = useCallback(
    (e: React.PointerEvent, p: Placed) => {
      e.stopPropagation()
      topZ.current += 1
      const z = topZ.current
      setPlaced((prev) =>
        prev.map((c) => (c.slug === p.slug ? { ...c, z } : c)),
      )
      beginDrag(e, p.slug, false, p.x, p.y)
    },
    [beginDrag],
  )

  // Keyboard / tap path: draw the top card straight onto the table, just
  // below the deck, cascading successive draws sideways so they don't stack
  // exactly. Makes the tool's primary action reachable without a drag —
  // Enter/Space/click on the deck button (and a plain finger tap) all land
  // here.
  const drawToTable = useCallback(() => {
    const slug = pileRef.current[0]
    if (!slug) return
    const rect = tableRef.current?.getBoundingClientRect()
    const w = cardWRef.current
    // Card height as a % of table height, from its on-screen aspect.
    const hPct = rect
      ? (((w / 100) * rect.width * cardAspectRef.current) / rect.height) * 100
      : 40
    const cascade = (topZ.current % 5) * (w / 4) - w / 2
    const raw = {
      x: (100 - w) / 2 + cascade,
      y: DECK_Y + hPct + 3,
    }
    const pos =
      rect && rect.width && rect.height ? clampToView(raw.x, raw.y, rect) : raw
    topZ.current += 1
    const z = topZ.current
    setPlaced((prev) => [
      ...prev,
      { slug, x: pos.x, y: pos.y, z, revealed: false },
    ])
    setPile((prev) => prev.filter((s) => s !== slug))
  }, [clampToView])

  const reshuffle = useCallback(() => {
    setPlaced([])
    topZ.current = 0
    setPile(shuffle(FULL_DECK))
  }, [])

  // The hint lives in the lower half of the board. Once the space is panned
  // far enough down that the deck descends past the board's vertical midline,
  // the deck would overlap the hint — so hide it.
  const deckBox = deckScreenBox(tableW, tableH, zoom, cardWPct, pan, cardAspect)
  const deckInLowerHalf =
    tableH > 0 && deckBox.top + deckBox.height > tableH / 2

  return {
    tableRef,
    cardWPct,
    deckXPct,
    zoom,
    setZoom,
    pan,
    placed,
    pile,
    drag,
    movedRef,
    deckInLowerHalf,
    startPan,
    startDeckDrag,
    startCardDrag,
    drawToTable,
    reshuffle,
  }
}
