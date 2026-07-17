'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/locales'

// The user's *preferred* locale, persisted to localStorage. Mirrors
// src/lib/colorPalette.ts: the store starts at the default (so
// SSR/static-export render is stable) and hydrates from localStorage
// once on mount. Distinct from the current page's locale (the
// LocaleProvider context in components/LocaleProvider.tsx): rendering
// always trusts the URL; this preference only decides where the
// language switcher and the first-visit bounce (in [locale]/layout.tsx)
// navigate to.

const STORAGE_KEY = 'bota:locale'

interface LocaleStore {
  localePref: Locale
  setLocalePref: (locale: Locale) => void
}

const useLocaleStore = create<LocaleStore>((set) => ({
  localePref: DEFAULT_LOCALE,
  setLocalePref: (localePref) => {
    set({ localePref })
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, localePref)
      } catch {
        // Private browsing / storage disabled — fail silently.
      }
    }
  },
}))

let didHydrate = false

function hydrateFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (
      saved &&
      isLocale(saved) &&
      saved !== useLocaleStore.getState().localePref
    ) {
      useLocaleStore.setState({ localePref: saved })
    }
  } catch {
    // Private browsing / storage disabled — keep the default.
  }
}

export function useLocalePref() {
  const localePref = useLocaleStore((s) => s.localePref)
  const setLocalePref = useLocaleStore((s) => s.setLocalePref)

  useEffect(() => {
    if (didHydrate) return
    didHydrate = true
    hydrateFromStorage()
  }, [])

  return { localePref, setLocalePref }
}
