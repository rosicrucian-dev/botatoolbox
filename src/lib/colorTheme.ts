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
      try {
        window.localStorage.setItem(STORAGE_KEY, colorTheme)
      } catch {
        // Private browsing / storage disabled — fail silently.
      }
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
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved && isValidTheme(saved) && saved !== colorTheme) {
        useColorThemeStore.setState({ colorTheme: saved })
      }
    } catch {
      // Private browsing / storage disabled — keep the default theme.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { colorTheme, setColorTheme }
}
