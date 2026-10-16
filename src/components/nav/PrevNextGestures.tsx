'use client'

import { useLocaleTransitionRouter } from '@/components/locale/LocaleLink'
import { useEffect } from 'react'

// Wires prev/next navigation to input gestures; renders nothing. Drop it on
// any page with prev/next semantics — either as hrefs to navigate to, or
// as onPrev/onNext callbacks for a page that steps its own state (the
// Daily Meditation day stepper):
//   - ArrowLeft / ArrowRight (ignoring inputs, contenteditables, modifiers)
//   - horizontal touch swipes — swipe left = next, swipe right = prev,
//     matching the arrow keys' page-turn direction.
//
// The swipe recognizer is deliberately conservative so everything else on
// the page keeps working exactly as before:
//   - listeners are passive and never preventDefault: vertical scrolling
//     is untouched, and taps on links/buttons still land (a tap's movement
//     never crosses the swipe threshold, and browsers already suppress the
//     trailing click after a real pan)
//   - swipes starting within EDGE_PX of either screen edge are ignored —
//     that zone belongs to iOS Safari's back/forward history gestures
//   - swipes starting inside a horizontally scrollable element (e.g. a
//     wide table) are ignored so it keeps its own panning
//   - mouse pointers are ignored (drag-selecting text on desktop must not
//     navigate), and a second touch aborts the gesture (pinch)
//   - if the browser claims the touch for scrolling (pointercancel), the
//     gesture is dropped — it was a scroll, not a swipe.

const SWIPE_MIN_PX = 56
// Horizontal displacement must beat vertical by this factor, or the
// gesture reads as a (diagonal) scroll.
const SWIPE_DOMINANCE = 1.5
const EDGE_PX = 28

function insideHorizontalScroller(start: EventTarget | null): boolean {
  let el = start instanceof Element ? start : null
  while (el && el !== document.body) {
    if (el.scrollWidth > el.clientWidth + 1) {
      const { overflowX } = getComputedStyle(el)
      if (overflowX === 'auto' || overflowX === 'scroll') return true
    }
    el = el.parentElement
  }
  return false
}

export function PrevNextGestures({
  prevHref,
  nextHref,
  onPrev,
  onNext,
}: {
  prevHref?: string
  nextHref?: string
  onPrev?: () => void
  onNext?: () => void
}) {
  // Transition-aware router: arrow-key/swipe page turns get the same
  // view-transition cross-fade as clicking a link.
  const router = useLocaleTransitionRouter()
  const hasPrev = Boolean(onPrev ?? prevHref)
  const hasNext = Boolean(onNext ?? nextHref)
  const goPrev = () => (onPrev ? onPrev() : prevHref && router.push(prevHref))
  const goNext = () => (onNext ? onNext() : nextHref && router.push(nextHref))

  // Arrow keys.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      // Text entry keeps its arrow keys; a focused checkbox doesn't need them.
      if (
        (target instanceof HTMLInputElement &&
          target.type !== 'checkbox' &&
          target.type !== 'radio') ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      )
        return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  // Touch swipes.
  useEffect(() => {
    let gesture: { id: number; x: number; y: number } | null = null

    function down(e: PointerEvent) {
      if (e.pointerType === 'mouse') return
      if (gesture) {
        // Second finger — this is a pinch/zoom, not a swipe.
        gesture = null
        return
      }
      if (e.clientX < EDGE_PX || e.clientX > window.innerWidth - EDGE_PX) return
      if (insideHorizontalScroller(e.target)) return
      gesture = { id: e.pointerId, x: e.clientX, y: e.clientY }
    }
    function up(e: PointerEvent) {
      const g = gesture
      if (!g || e.pointerId !== g.id) return
      gesture = null
      const dx = e.clientX - g.x
      const dy = e.clientY - g.y
      if (
        Math.abs(dx) < SWIPE_MIN_PX ||
        Math.abs(dx) < SWIPE_DOMINANCE * Math.abs(dy)
      )
        return
      if (dx < 0) {
        if (hasNext) goNext()
      } else if (hasPrev) goPrev()
    }
    function cancel(e: PointerEvent) {
      if (gesture?.id === e.pointerId) gesture = null
    }
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', cancel, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
    }
  })

  // Prefetch both neighbors so a swipe (or arrow press) lands instantly —
  // the PrevNextNav links at the bottom only prefetch once scrolled into
  // view.
  useEffect(() => {
    if (prevHref) router.prefetch(prevHref)
    if (nextHref) router.prefetch(nextHref)
  }, [prevHref, nextHref, router])

  return null
}
