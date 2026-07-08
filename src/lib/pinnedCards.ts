'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

import { visibleNavigation } from '@/lib/nav'

// The user's pinned homepage cards, persisted to localStorage.
//
// Nobody has any pins by default — a new visitor starts empty and pins
// only what they choose. The store also starts EMPTY at render time,
// which matters for the static export: whatever `pins` holds is what the
// export bakes into the HTML, and the server can't read a visitor's
// localStorage, so it must never render a *guessed* pin. Rendering no
// pins is always safe; the real set fills in after hydration.
//
// So the static HTML renders no Pinned section at all (PinnedSection
// returns null when there are no pins), and the section appears after
// hydration once the real pins load. Nothing is ever rendered and then
// removed.
//
// Two storage states, both meaning what they say:
//   - key absent / stored "[]" → no pins
//   - stored ["/a","/b"]       → those pins
//
// Pins are stored as hrefs (unique across the whole nav). Unknown hrefs
// — a page removed since the pin was made — are dropped on read so the
// section never references a dead link.

const STORAGE_KEY = 'bota:pinned-cards'

// Every href the nav actually exposes — the allowlist a stored/restored
// pin set is filtered against. Built once from the static nav (includes
// gated groups; visibility gating is applied at render time, so a pin
// made while unlocked survives a re-lock in storage).
const VALID_HREFS: ReadonlySet<string> = new Set(
  visibleNavigation.flatMap((group) => group.links.map((link) => link.href)),
)

// Keep only known hrefs, in order, de-duplicated.
function sanitize(hrefs: ReadonlyArray<string>): Array<string> {
  const seen = new Set<string>()
  const out: Array<string> = []
  for (const href of hrefs) {
    if (VALID_HREFS.has(href) && !seen.has(href)) {
      seen.add(href)
      out.push(href)
    }
  }
  return out
}

function persist(pins: ReadonlyArray<string>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pins))
  } catch {
    // Private browsing / storage disabled — fail silently.
  }
}

interface PinnedStore {
  pins: Array<string>
  // Pin if absent, unpin if present. New pins append to the end.
  togglePin: (href: string) => void
  // Replace the whole set (used by the settings-permalink restore).
  setPins: (hrefs: ReadonlyArray<string>) => void
}

const usePinnedStore = create<PinnedStore>((set, get) => ({
  // Empty at first render (SSR + hydration) so the static HTML has no
  // Pinned section; hydrateFromStorage fills in the saved pins after
  // mount. See the file header.
  pins: [],
  togglePin: (href) => {
    if (!VALID_HREFS.has(href)) return
    const current = get().pins
    const next = current.includes(href)
      ? current.filter((h) => h !== href)
      : [...current, href]
    set({ pins: next })
    persist(next)
  },
  setPins: (hrefs) => {
    const next = sanitize(hrefs)
    set({ pins: next })
    persist(next)
  },
}))

// Reconcile with localStorage once for the whole app (the store is
// global, so a single read suffices), filling the saved pins after mount.
// A missing key (or "[]") means no pins — the empty initial state already
// covers it, so there's nothing to apply.
let didHydrate = false

function hydrateFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return // never set — no pins
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return
    const next = sanitize(parsed.filter((x): x is string => typeof x === 'string'))
    usePinnedStore.setState({ pins: next })
  } catch {
    // Corrupt/blocked storage — leave pins empty (no section).
  }
}

// The pin set and its mutators. Triggers the one-time hydration on first
// mount, mirroring useColorPalette.
export function usePinnedCards() {
  const pins = usePinnedStore((s) => s.pins)
  const togglePin = usePinnedStore((s) => s.togglePin)
  const setPins = usePinnedStore((s) => s.setPins)

  useEffect(() => {
    if (didHydrate) return
    didHydrate = true
    hydrateFromStorage()
  }, [])

  return { pins, togglePin, setPins }
}

// Per-card subscription: re-renders only when this href's pinned state
// flips, not on every change to the set.
export function useIsPinned(href: string): boolean {
  return usePinnedStore((s) => s.pins.includes(href))
}

// The toggle mutator, without subscribing to the pin set — so a pin
// button re-renders only when its own href flips (via useIsPinned), not
// on every pin/unpin anywhere. Does not trigger hydration; the always-
// mounted PinnedSection (usePinnedCards) owns that.
export function useTogglePin(): (href: string) => void {
  return usePinnedStore((s) => s.togglePin)
}
