import { useSyncExternalStore } from 'react'

// Live boolean for the user's `prefers-reduced-motion` setting, read via
// useSyncExternalStore so it's SSR-safe (server renders "animate") and
// stays in sync without a setState-in-effect. The MediaQueryList is created
// lazily on the client and reused across renders.
const QUERY = '(prefers-reduced-motion: reduce)'

let mql: MediaQueryList | null = null
function mediaQuery(): MediaQueryList {
  if (!mql) mql = window.matchMedia(QUERY)
  return mql
}

function subscribe(onChange: () => void): () => void {
  const m = mediaQuery()
  m.addEventListener('change', onChange)
  return () => m.removeEventListener('change', onChange)
}

const getSnapshot = (): boolean => mediaQuery().matches
// No motion preference is known during SSR — default to animating.
const getServerSnapshot = (): boolean => false

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
