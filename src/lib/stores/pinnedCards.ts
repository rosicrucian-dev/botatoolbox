'use client'

import { useVisibleNav } from '@/components/nav/NavProvider'

import { createPersistedStore, readStorage, writeStorage } from './persisted'

// The user's pinned homepage cards, persisted to localStorage.
//
// Nobody has any pins by default — a new visitor starts empty and pins
// only what they choose. The store also starts EMPTY at render time
// (hydration: see ./persisted.ts), so the static HTML renders no Pinned
// section at all (PinnedSection returns null when there are no pins) and
// the section appears after hydration once the real pins load. Nothing is
// ever rendered and then removed.
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
// pin set is filtered against. Filled from the NavProvider context by the
// hooks below (the nav is server-assembled; hrefs are locale-independent,
// and local development links are included when mounted.
// Module-level because the store's mutators run outside React.
let validHrefs: ReadonlySet<string> | null = null

function ensureValidHrefs(
  groups: ReadonlyArray<{ links: ReadonlyArray<{ href: string }> }>,
): void {
  if (validHrefs || groups.length === 0) return
  validHrefs = new Set(
    groups.flatMap((group) => group.links.map((link) => link.href)),
  )
}

// Keep only known hrefs, in order, de-duplicated.
function sanitize(hrefs: ReadonlyArray<string>): Array<string> {
  const seen = new Set<string>()
  const out: Array<string> = []
  for (const href of hrefs) {
    if (validHrefs?.has(href) && !seen.has(href)) {
      seen.add(href)
      out.push(href)
    }
  }
  return out
}

function persist(pins: ReadonlyArray<string>): void {
  writeStorage(STORAGE_KEY, JSON.stringify(pins))
}

interface PinnedState {
  pins: Array<string>
  // Pin if absent, unpin if present. New pins append to the end.
  togglePin: (href: string) => void
  // Replace the whole set (used by the settings-permalink restore).
  setPins: (hrefs: ReadonlyArray<string>) => void
}

const { useStore, useHydrate } = createPersistedStore<PinnedState>(
  (set, get) => ({
    pins: [],
    togglePin: (href) => {
      if (!validHrefs?.has(href)) return
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
  }),
  // A missing key (or "[]") means no pins — the empty initial state
  // already covers it. Corrupt JSON throws and is caught by the helper.
  () => {
    const raw = readStorage(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return {
      pins: sanitize(parsed.filter((x): x is string => typeof x === 'string')),
    }
  },
)

// The pin set and its mutators. Owns the one-time hydration (it is the
// always-mounted consumer, via PinnedSection).
export function usePinnedCards() {
  ensureValidHrefs(useVisibleNav())
  useHydrate()
  const pins = useStore((s) => s.pins)
  const togglePin = useStore((s) => s.togglePin)
  const setPins = useStore((s) => s.setPins)
  return { pins, togglePin, setPins }
}

// Per-card subscription: re-renders only when this href's pinned state
// flips, not on every change to the set.
export function useIsPinned(href: string): boolean {
  return useStore((s) => s.pins.includes(href))
}

// The toggle mutator, without subscribing to the pin set — so a pin
// button re-renders only when its own href flips (via useIsPinned), not
// on every pin/unpin anywhere. Does not trigger hydration; the always-
// mounted PinnedSection (usePinnedCards) owns that.
export function useTogglePin(): (href: string) => void {
  ensureValidHrefs(useVisibleNav())
  return useStore((s) => s.togglePin)
}
