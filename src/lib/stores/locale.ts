'use client'

import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/locales'

import { createPersistedStore, readStorage, writeStorage } from './persisted'

// The user's *preferred* locale, persisted to localStorage. Distinct from
// the current page's locale (the LocaleProvider context in
// components/locale/LocaleProvider.tsx): rendering always trusts the URL;
// this preference only decides where the language switcher and the
// first-visit bounce (in [locale]/layout.tsx) navigate to. Hydration: see
// ./persisted.ts.

const STORAGE_KEY = 'bota:locale'

interface LocaleState {
  localePref: Locale
  setLocalePref: (locale: Locale) => void
}

const { useStore, useHydrate } = createPersistedStore<LocaleState>(
  (set) => ({
    localePref: DEFAULT_LOCALE,
    setLocalePref: (localePref) => {
      set({ localePref })
      writeStorage(STORAGE_KEY, localePref)
    },
  }),
  () => {
    const saved = readStorage(STORAGE_KEY)
    return saved && isLocale(saved) ? { localePref: saved } : null
  },
)

export function useLocalePref() {
  useHydrate()
  const localePref = useStore((s) => s.localePref)
  const setLocalePref = useStore((s) => s.setLocalePref)
  return { localePref, setLocalePref }
}
