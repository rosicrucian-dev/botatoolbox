'use client'

import { useCallback, useEffect, useState } from 'react'

// Boolean preference backed by localStorage. SSR renders with
// `defaultValue`; after mount, useEffect rehydrates from storage (a
// one-frame flicker is acceptable for quiet preferences). Writes happen
// only when the caller updates the value, so we never overwrite stored
// state with the default during hydration.
//
// The write happens outside the setState updater (updaters must stay
// pure). Resolving a functional `next` against the closed-over `value`
// is fine here — this is only called from event handlers, where `value`
// is current.
export function usePersistedToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setValue(stored === '1')
    } catch {
      // Private browsing / storage disabled — keep the default.
    }
  }, [key])

  const setPersistedValue = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const v = typeof next === 'function' ? next(value) : next
      try {
        localStorage.setItem(key, v ? '1' : '0')
      } catch {
        // Private browsing / storage disabled — fail silently.
      }
      setValue(v)
    },
    [key, value],
  )

  return [value, setPersistedValue] as const
}
