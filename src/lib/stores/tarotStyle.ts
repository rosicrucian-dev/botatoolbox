'use client'

import {
  DEFAULT_MAJOR_STYLE,
  DEFAULT_MINOR_STYLE,
  isMajorStyle,
  isMinorStyle,
} from '@/content/data/tarot-styles'

import { createPersistedStore, readStorage, writeStorage } from './persisted'

// Two independent, login-free preferences — the chosen art style for each
// arcana — persisted to localStorage under separate keys. Hydration: see
// ./persisted.ts.

const MAJOR_KEY = 'bota:tarot-major-style'
const MINOR_KEY = 'bota:tarot-minor-style'

interface TarotStyleState {
  majorStyle: string
  minorStyle: string
  setMajorStyle: (id: string) => void
  setMinorStyle: (id: string) => void
}

const { useStore, useHydrate } = createPersistedStore<TarotStyleState>(
  (set) => ({
    majorStyle: DEFAULT_MAJOR_STYLE,
    minorStyle: DEFAULT_MINOR_STYLE,
    setMajorStyle: (majorStyle) => {
      set({ majorStyle })
      writeStorage(MAJOR_KEY, majorStyle)
    },
    setMinorStyle: (minorStyle) => {
      set({ minorStyle })
      writeStorage(MINOR_KEY, minorStyle)
    },
  }),
  // Unknown/removed style ids are ignored so the default holds.
  () => {
    const patch: Partial<TarotStyleState> = {}
    const mj = readStorage(MAJOR_KEY)
    if (mj && isMajorStyle(mj)) patch.majorStyle = mj
    const mn = readStorage(MINOR_KEY)
    if (mn && isMinorStyle(mn)) patch.minorStyle = mn
    return patch
  },
)

// Returns the active major/minor art styles and their setters. Per-field
// selectors, so a component that only reads `majorStyle` doesn't re-render
// when `minorStyle` changes.
export function useTarotStyle() {
  useHydrate()
  const majorStyle = useStore((s) => s.majorStyle)
  const minorStyle = useStore((s) => s.minorStyle)
  const setMajorStyle = useStore((s) => s.setMajorStyle)
  const setMinorStyle = useStore((s) => s.setMinorStyle)
  return { majorStyle, minorStyle, setMajorStyle, setMinorStyle }
}
