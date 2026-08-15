'use client'

import { useMemo } from 'react'

import { useLocale } from '@/components/LocaleProvider'

import { t, tDyn, type MessageKey } from './index'

/**
 * Client-side chrome translation bound to the current page's locale.
 * The returned callbacks are referentially stable per locale, so they
 * can sit in hook dependency arrays without defeating memoization.
 */
export function useT() {
  const locale = useLocale()
  return useMemo(
    () => ({
      t: (key: MessageKey) => t(locale, key),
      tDyn: (key: string, english: string) => tDyn(locale, key, english),
    }),
    [locale],
  )
}
