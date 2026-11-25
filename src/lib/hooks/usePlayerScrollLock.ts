import { useLayoutEffect } from 'react'

// Shared by every full-screen player shell (SlidePlayer, the Cube of
// Space / Tree of Life expand views).
//
// iOS standalone-mode bugfix. When navigating from a scrolled docs page
// into a player route, iOS PWAs anchor `position: fixed` layers against
// the document's scroll position AT THE MOMENT THE LAYER FIRST PAINTS —
// and never re-anchor afterward. Symptom: the player renders shifted
// upward by the previous page's scroll amount (header tucked under the
// Dynamic Island, a band of exposed canvas at the bottom). Safari
// proper handles this correctly; it's standalone-only.
//
// Two parts, both timing-sensitive:
//   1. Reset scroll in useLayoutEffect — BEFORE the first paint. A
//      plain useEffect runs after paint, which loses the race: iOS has
//      already latched the fixed layer to the stale offset by then.
//   2. Lock the body with `position: fixed`, not just overflow:hidden.
//      iOS treats body overflow as advisory — rubber-band scrolling can
//      still move the root scroller behind the player, re-triggering
//      the same mis-anchoring. Pinning the body removes the root
//      scroller entirely while the player is mounted.
//
// Styles are restored on unmount; the route navigated to on close
// handles its own scroll position (Next scrolls to top).
export function usePlayerScrollLock() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    const { style } = document.body
    const prev = {
      position: style.position,
      inset: style.inset,
      overflow: style.overflow,
    }
    style.position = 'fixed'
    style.inset = '0'
    style.overflow = 'hidden'
    return () => {
      style.position = prev.position
      style.inset = prev.inset
      style.overflow = prev.overflow
    }
  }, [])
}
