'use client'

import { useEffect, useState } from 'react'

// True when the page was launched from an installed PWA / Home Screen
// install (iOS Safari, Android, desktop installed PWA). Always returns
// `false` during SSR and on the first client render so hydration matches;
// flips to the real value in the layout effect on the first mount.
export function useStandaloneDisplay(): boolean {
  const [standalone, setStandalone] = useState(false)
  useEffect(() => {
    function check(): boolean {
      if (typeof window === 'undefined') return false
      if (window.matchMedia?.('(display-mode: standalone)').matches)
        return true
      // iOS Safari prior to display-mode support.
      const iosStandalone = (window.navigator as Navigator & { standalone?: boolean })
        .standalone
      return iosStandalone === true
    }
    setStandalone(check())
    const mql = window.matchMedia?.('(display-mode: standalone)')
    if (!mql) return
    const onChange = () => setStandalone(check())
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return standalone
}
