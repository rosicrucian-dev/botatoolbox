'use client'

import {
  DEFAULT_COLOR_PALETTE,
  isColorPalette,
  type ColorPaletteId,
} from '@/lib/colors'

import { createPersistedStore, readStorage, writeStorage } from './persisted'

// The active color palette (FLO / Tailwind), persisted to localStorage.
// This is the BOTA color spectrum, not the light/dark UI mode (which
// simply follows the system scheme). Hydration: see ./persisted.ts.

const STORAGE_KEY = 'bota:color-palette'

interface ColorPaletteState {
  colorPalette: ColorPaletteId
  setColorPalette: (colorPalette: ColorPaletteId) => void
}

const { useStore, useHydrate } = createPersistedStore<ColorPaletteState>(
  (set) => ({
    colorPalette: DEFAULT_COLOR_PALETTE,
    setColorPalette: (colorPalette) => {
      set({ colorPalette })
      writeStorage(STORAGE_KEY, colorPalette)
    },
  }),
  // Unknown/removed palette ids are ignored so the default holds.
  () => {
    const saved = readStorage(STORAGE_KEY)
    return saved && isColorPalette(saved) ? { colorPalette: saved } : null
  },
)

// Returns the active color palette and its setter. Subscribes via a selector
// so consumers only re-render when the palette changes.
export function useColorPalette() {
  useHydrate()
  const colorPalette = useStore((s) => s.colorPalette)
  const setColorPalette = useStore((s) => s.setColorPalette)
  return { colorPalette, setColorPalette }
}
