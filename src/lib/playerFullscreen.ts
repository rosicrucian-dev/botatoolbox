import { useEffect } from 'react'

// True fullscreen for the full-screen players — the Element Fullscreen
// API (on iPhone since iOS 16.4, our support floor), which hides the
// status bar entirely: the only way web content goes genuinely
// edge-to-edge, same presentation as fullscreen video.
//
// The API requires a user gesture, and entering a player IS one: the
// tap on a Focus/Play/Expand control. enterPlayerFullscreen() is called
// inside those click handlers (the same trick PlayLink already uses to
// prime the AudioContext) and targets <html>, which survives the
// client-side navigation into the player route — so the player mounts
// already fullscreen. Gestureless entries (bookmark, reload, continue
// chip) silently skip and the player runs in normal chrome as before.
//
// Touch devices only: auto-fullscreening a desktop browser from a
// click is the F11 experience nobody asked for.

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => void
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => void
}

export function enterPlayerFullscreen() {
  if (typeof document === 'undefined') return
  if (!window.matchMedia('(pointer: coarse)').matches) return
  const root = document.documentElement as FullscreenElement
  try {
    if (root.requestFullscreen) {
      void root.requestFullscreen().catch(() => {
        // Denied (no gesture budget, iframe policy) — normal chrome.
      })
    } else {
      root.webkitRequestFullscreen?.()
    }
  } catch {}
}

export function exitPlayerFullscreen() {
  if (typeof document === 'undefined') return
  const doc = document as FullscreenDocument
  const active = doc.fullscreenElement ?? doc.webkitFullscreenElement
  if (!active) return
  try {
    if (doc.exitFullscreen) {
      void doc.exitFullscreen().catch(() => {})
    } else {
      doc.webkitExitFullscreen?.()
    }
  } catch {}
}

// Leaves fullscreen when the calling player unmounts (close button,
// Esc, back-swipe) so the docs pages never render chrome-less. Pass
// false for components that also mount outside a player context (e.g.
// FreeformClient's inline variant).
export function usePlayerFullscreenExit(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    return () => exitPlayerFullscreen()
  }, [enabled])
}
