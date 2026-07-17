'use client'

// Freeform tabletop: draw cards off a deck, drop them anywhere, drag to
// rearrange, pan/zoom the space. This file is just the rendering — all
// state and gesture handling lives in useFreeformSpread, the coordinate
// math and persistence in @/lib/freeform.

import { Link, useLocaleRouter } from '@/components/LocaleLink'
import { useLocale } from '@/components/LocaleProvider'
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline'
import { memo, useEffect } from 'react'

import { MajorImage, MinorImage } from '@/components/CardImage'
import { Button } from '@/components/catalyst/button'
import { PageToolbar } from '@/components/PageToolbar'
import { Tabs } from '@/components/Tabs'
import { toolbarButtonSize } from '@/components/toolbarButton'
import { useFreeformSpread } from '@/components/useFreeformSpread'
import { majorAspectRatio, minorAspectRatio } from '@/content/data'
import {
  DECK_Y,
  DECK_Z,
  DRAG_Z,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  resolveSlug,
  type Placed,
} from '@/lib/freeform'
import {
  enterPlayerFullscreen,
  usePlayerFullscreenExit,
} from '@/lib/playerFullscreen'
import { useTarotStyle } from '@/lib/tarotStyle'

// Optimized card-back used for the deck top and the face-down side of the
// flip (see public/tarot/back.jpg — a thumbnail of
// public/files/tarot-back-freeform.jpg, the edge-cropped back art).
const BACK_IMAGE = '/tarot/back.jpg'

// One card's face, sized to fill its absolutely-positioned wrapper. Majors use
// the 362w thumbnail (~⅓ the bytes of the full image); minors use the colored
// set, which is already thumbnail-sized (~270w), so it has no separate thumb.
//
// Each card is shown at its art's *own* canonical ratio (from the active major
// / minor style) rather than a single forced proportion — so nothing is clipped
// or stretched, no matter which style is active or whether it's a major or a
// minor. The face drives the card's box; the face-down side is `inset-0` (see
// the placed-card render), so the back simply fills whatever box the face sets.
function CardFace({ slug }: { slug: string }) {
  const { majorStyle, minorStyle } = useTarotStyle()
  const locale = useLocale()
  const found = resolveSlug(slug, locale)
  if (!found) return null
  if (found.kind === 'major') {
    return (
      <MajorImage
        card={found.card}
        thumb
        alt={found.card.name}
        loading="lazy"
        draggable={false}
        style={{ aspectRatio: majorAspectRatio(majorStyle) }}
        className="w-full object-cover shadow-lg"
      />
    )
  }
  return (
    <MinorImage
      card={found.card}
      alt={`${found.card.num} of ${found.card.suit}`}
      loading="lazy"
      draggable={false}
      style={{ aspectRatio: minorAspectRatio(minorStyle) }}
      className="w-full object-cover shadow-lg"
    />
  )
}

// One placed card. Memoized so a drag/pan frame — which re-renders the
// board via setDrag/setPan — reconciles only the card actually moving:
// every prop here is a primitive or a stable reference for untouched
// cards (the hook's setPlaced preserves object identity for cards it
// doesn't change, and startCardDrag/movedRef are stable).
const PlacedCard = memo(function PlacedCard({
  card,
  x,
  y,
  isDragging,
  widthPct,
  onPointerDown,
  movedRef,
}: {
  card: Placed
  x: number
  y: number
  isDragging: boolean
  widthPct: number
  onPointerDown: (e: React.PointerEvent, p: Placed) => void
  movedRef: React.RefObject<boolean>
}) {
  return (
    <Link
      href={`/tarot/${card.slug}`}
      draggable={false}
      onPointerDown={(e) => onPointerDown(e, card)}
      onClick={(e) => {
        // The pointerup that ends a drag also fires a click; suppress
        // it so only a genuine tap follows the link.
        if (movedRef.current) e.preventDefault()
      }}
      className={`absolute block select-none ${isDragging ? 'scale-[1.04]' : ''} ${card.removing ? 'pointer-events-none' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${widthPct}%`,
        zIndex: isDragging || card.removing ? DRAG_Z : card.z,
        touchAction: 'none',
        perspective: '1000px',
      }}
    >
      <span
        className="relative block transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: card.revealed ? 'rotateY(0deg)' : 'rotateY(180deg)',
        }}
      >
        <span className="block" style={{ backfaceVisibility: 'hidden' }}>
          <CardFace slug={card.slug} />
        </span>
        <img
          src={BACK_IMAGE}
          alt=""
          draggable={false}
          // inset-0 fills the face's box, so the back always matches
          // whatever ratio the face (CardFace) set — keeps the flip
          // consistent across styles and major/minor.
          className="absolute inset-0 h-full w-full object-cover shadow-lg"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        />
      </span>
    </Link>
  )
})

export function FreeformClient({
  variant = 'inline',
}: {
  variant?: 'inline' | 'expand'
} = {}) {
  const router = useLocaleRouter()
  // The active major ratio shapes the generic card slots (deck pile,
  // placeholder, in-flight draw) — placed cards take each card's own ratio
  // via CardFace.
  const { majorStyle } = useTarotStyle()
  const deckAspect = majorAspectRatio(majorStyle)

  const {
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
  } = useFreeformSpread()

  // If the Expand tap put us in true fullscreen, leave it when the
  // expand variant unmounts. Disabled inline: the inline board also
  // unmounts on the way INTO the expand route, and exiting there would
  // cancel the fullscreen just requested.
  usePlayerFullscreenExit(variant === 'expand')

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
          <MagnifyingGlassMinusIcon className="h-5 w-5" />
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
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
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
          Keep transformOrigin in sync with ZOOM_ORIGIN_X in lib/freeform. */}
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
            // A drag that ends back over the deck fires a trailing click —
            // that's a cancel, not a tap-to-draw.
            if (movedRef.current) return
            if (pile.length === 0) reshuffle()
            else drawToTable()
          }}
          aria-label={pile.length > 0 ? 'Draw a card' : 'Reshuffle'}
          className="absolute block transition select-none active:scale-95"
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
              style={{ aspectRatio: deckAspect }}
              className="w-full object-cover shadow-xl"
            />
          ) : (
            <span
              style={{ aspectRatio: deckAspect }}
              className="block w-full border-2 border-dashed border-zinc-300 dark:border-zinc-600"
            />
          )}
        </button>

        {/* Placed cards. The one being rearranged rides the cursor (positioned
            from the live drag state) but stays the same element, so a tap still
            follows its link and a drag does not. */}
        {placed.map((p) => {
          const isDragging = draggingExisting === p.slug
          return (
            <PlacedCard
              key={p.slug}
              card={p}
              x={isDragging ? drag!.x : p.x}
              y={isDragging ? drag!.y : p.y}
              isDragging={isDragging}
              widthPct={cardWPct}
              onPointerDown={startCardDrag}
              movedRef={movedRef}
            />
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
              style={{ aspectRatio: deckAspect }}
              className="w-full object-cover shadow-2xl"
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
            Take a deep breath, set an intention, and draw a card.
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
              className="relative flex size-9 items-center justify-center rounded-md transition hover:bg-zinc-900/5 dark:hover:bg-white/5"
            >
              {/* Enlarged touch target on coarse pointers — matches
                  PlayerHeader's close button. */}
              <span className="absolute size-12 pointer-fine:hidden" />
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
      <PageToolbar
        title="Freeform"
        splitMobileActions
        actionsClassName="text-zinc-900 dark:text-white"
        secondaryActionsClassName="gap-3"
        secondaryActions={controls}
        primaryAction={
          <Button
            href={expandHref}
            onClick={enterPlayerFullscreen}
            color="emerald"
            aria-label="Expand"
            className={toolbarButtonSize}
          >
            Expand ⤢
          </Button>
        }
      />
      {board}
    </article>
  )
}
