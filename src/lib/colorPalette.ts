'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

import {
  DEFAULT_COLOR_PALETTE,
  isColorPalette,
  type ColorPaletteId,
} from '@/lib/colors'

// The active color palette (FLO / Apple), persisted to localStorage. Mirrors
// src/lib/tarotStyle.ts: the store starts at the default (so SSR/static-export
// render is stable) and hydrates from localStorage once on mount, switching to
// the saved choice on the client. Distinct from next-themes' light/dark
// `useTheme` — this is the BOTA color spectrum, not the UI mode.

const STORAGE_KEY = 'bota:color-palette'

interface ColorPaletteStore {
  colorPalette: ColorPaletteId
  setColorPalette: (colorPalette: ColorPaletteId) => void
}

const useColorPaletteStore = create<ColorPaletteStore>((set) => ({
  colorPalette: DEFAULT_COLOR_PALETTE,
  setColorPalette: (colorPalette) => {
    set({ colorPalette })
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, colorPalette)
      } catch {
        // Private browsing / storage disabled — fail silently.
      }
    }
  },
}))

// Read the saved palette from localStorage and apply it. Runs at most once for
// the whole app (guarded by the module-level flag) rather than per consumer —
// the store is global, so a single read suffices. Guarded against the current
// value so a saved palette equal to the default doesn't churn the store.
let didHydrate = false

function hydrateFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (
      saved &&
      isColorPalette(saved) &&
      saved !== useColorPaletteStore.getState().colorPalette
    ) {
      useColorPaletteStore.setState({ colorPalette: saved })
    }
  } catch {
    // Private browsing / storage disabled — keep the default.
  }
}

// Returns the active color palette and its setter. Subscribes via a selector so
// consumers only re-render when the palette changes. Triggers the one-time
// hydration on first mount; unknown/removed palette ids are ignored so the
// default holds.
export function useColorPalette() {
  const colorPalette = useColorPaletteStore((s) => s.colorPalette)
  const setColorPalette = useColorPaletteStore((s) => s.setColorPalette)

  useEffect(() => {
    if (didHydrate) return
    didHydrate = true
    hydrateFromStorage()
  }, [])

  return { colorPalette, setColorPalette }
}
