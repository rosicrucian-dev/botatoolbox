'use client'

import { useEffect, useState } from 'react'

// SSR-safe media query: renders `defaultValue` on the server and the first
// client paint, then tracks the real match (and follows viewport changes).
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const apply = () => setMatches(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [query])
  return matches
}
