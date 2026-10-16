'use client'

import { useEffect } from 'react'
import { create, type StateCreator } from 'zustand'

// The one "static-export hydration dance" every persisted preference store
// in this folder follows. The site is exported to static HTML, so the
// server can never read a visitor's localStorage: a store must START at a
// default the export can bake in, and only after mount read the saved
// value and switch to it. `hydrated` flips to true once that read has
// happened, so a consumer can tell "still the default" from "definitely
// the saved value" (the timer player waits on it before bouncing back).
//
// Usage:
//
//   const { useStore, useHydrate } = createPersistedStore<State>(
//     (set) => ({
//       value: DEFAULT,
//       setValue: (value) => {
//         set({ value })
//         writeStorage(KEY, value)
//       },
//     }),
//     () => {
//       const saved = readStorage(KEY)
//       return saved && isValid(saved) ? { value: saved } : null
//     },
//   )
//
//   export function useValue() {
//     useHydrate() // one read per app, on the first mount of any consumer
//     return { value: useStore((s) => s.value), setValue: useStore((s) => s.setValue) }
//   }
//
// `restore` runs once on the client and returns the patch to apply; it may
// throw (corrupt JSON) — the store then keeps its defaults. Setters persist
// through writeStorage so a blocked storage (private browsing) never
// throws into React.

/** localStorage read that is a no-op on the server and when blocked. */
export function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** localStorage write (null removes) that swallows storage errors. */
export function writeStorage(key: string, value: string | null): void {
  if (typeof window === 'undefined') return
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Private browsing / storage disabled — the in-memory value still
    // applies for this session.
  }
}

export interface Hydrated {
  /** True once the saved value has been read (or found absent). */
  hydrated: boolean
}

export function createPersistedStore<T extends object>(
  init: StateCreator<T & Hydrated, [], [], T>,
  restore: () => Partial<T> | null | undefined,
) {
  const useStore = create<T & Hydrated>()((set, get, api) => ({
    ...init(set, get, api),
    hydrated: false,
  }))

  // Module-level once-flag: the store is global, so one read serves every
  // consumer no matter how many mount.
  let didHydrate = false
  function hydrateNow(): void {
    if (didHydrate || typeof window === 'undefined') return
    didHydrate = true
    let patch: Partial<T> | null | undefined = null
    try {
      patch = restore()
    } catch {
      patch = null
    }
    useStore.setState({ ...(patch ?? {}), hydrated: true } as Partial<
      T & Hydrated
    >)
  }

  /** Call from every public hook of the store: hydrates on first mount. */
  function useHydrate(): void {
    useEffect(hydrateNow, [])
  }

  return { useStore, useHydrate, hydrateNow }
}
