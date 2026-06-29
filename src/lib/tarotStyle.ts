'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

import {
  DEFAULT_MAJOR_STYLE,
  DEFAULT_MINOR_STYLE,
  isMajorStyle,
  isMinorStyle,
} from '@/content/data/tarot-styles'

// Two independent, login-free preferences — the chosen art style for each
// arcana — persisted to localStorage. Mirrors src/lib/colorTheme.ts: the store
// starts at the defaults (so SSR/static-export render is stable) and hydrates
// from localStorage on mount, switching to the saved choice on the client.

const MAJOR_KEY = 'bota:tarot-major-style'
const MINOR_KEY = 'bota:tarot-minor-style'

function persist(key: string, value: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Private browsing / storage disabled — fail silently.
  }
}

interface TarotStyleStore {
  majorStyle: string
  minorStyle: string
  setMajorStyle: (id: string) => void
  setMinorStyle: (id: string) => void
}

const useTarotStyleStore = create<TarotStyleStore>((set) => ({
  majorStyle: DEFAULT_MAJOR_STYLE,
  minorStyle: DEFAULT_MINOR_STYLE,
  setMajorStyle: (majorStyle) => {
    set({ majorStyle })
    persist(MAJOR_KEY, majorStyle)
  },
  setMinorStyle: (minorStyle) => {
    set({ minorStyle })
    persist(MINOR_KEY, minorStyle)
  },
}))

// Read saved styles from localStorage and apply them to the store. Runs at most
// once for the whole app (guarded by the module-level flag below) rather than
// per consumer — the store is global, so a single read suffices no matter how
// many card images are on the page. Each assignment is guarded against the
// current value so a saved style equal to the default doesn't churn the store.
let didHydrate = false

function hydrateFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const { majorStyle, minorStyle } = useTarotStyleStore.getState()
    const patch: Partial<TarotStyleStore> = {}
    const mj = window.localStorage.getItem(MAJOR_KEY)
    if (mj && isMajorStyle(mj) && mj !== majorStyle) patch.majorStyle = mj
    const mn = window.localStorage.getItem(MINOR_KEY)
    if (mn && isMinorStyle(mn) && mn !== minorStyle) patch.minorStyle = mn
    if (Object.keys(patch).length > 0) useTarotStyleStore.setState(patch)
  } catch {
    // Private browsing / storage disabled — keep the defaults.
  }
}

// Returns the active major/minor art styles and their setters. Subscribes via
// per-field selectors so a component that only reads `majorStyle` doesn't
// re-render when `minorStyle` changes. Triggers the one-time hydration on first
// mount; unknown/removed style ids are ignored so the default holds.
export function useTarotStyle() {
  const majorStyle = useTarotStyleStore((s) => s.majorStyle)
  const minorStyle = useTarotStyleStore((s) => s.minorStyle)
  const setMajorStyle = useTarotStyleStore((s) => s.setMajorStyle)
  const setMinorStyle = useTarotStyleStore((s) => s.setMinorStyle)

  useEffect(() => {
    if (didHydrate) return
    didHydrate = true
    hydrateFromStorage()
  }, [])

  return { majorStyle, minorStyle, setMajorStyle, setMinorStyle }
}
