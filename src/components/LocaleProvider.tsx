'use client'

import { createContext, useContext } from 'react'

import { DEFAULT_LOCALE, type Locale } from '@/lib/locales'

// The current *page's* locale, set once per request by the [locale]
// layout. Distinct from the user's saved preference (src/lib/locale.ts):
// rendering always trusts this context, the preference only decides
// where the switcher and the first-visit bounce navigate to. Defaults
// to English so trees outside [locale] (the root not-found boundary)
// stay safe.
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}
