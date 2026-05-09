'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

import { DEFAULT_THEME, THEME_IDS, type ThemeId } from '@/lib/colors'

const STORAGE_KEY = 'bota:theme'

function isValidTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEME_IDS.includes(value as ThemeId)
}

interface ColorThemeStore {
  colorTheme: ThemeId
  setColorTheme: (colorTheme: ThemeId) => void
}

const useColorThemeStore = create<ColorThemeStore>((set) => ({
  colorTheme: DEFAULT_THEME,
  setColorTheme: (colorTheme) => {
    set({ colorTheme })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, colorTheme)
    }
  },
}))

// Hook: returns the active color theme (the BOTA palette — fhl/apple) and
// a setter. Distinct from `useTheme` from `next-themes` (light/dark mode);
// renamed to remove that ambiguity. Hydrates from localStorage on mount so
// SSR/static-export pages start with the default and switch to the saved
// choice on the client.
export function useColorTheme() {
  const { colorTheme, setColorTheme } = useColorThemeStore()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && isValidTheme(saved) && saved !== colorTheme) {
      useColorThemeStore.setState({ colorTheme: saved })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { colorTheme, setColorTheme }
}
