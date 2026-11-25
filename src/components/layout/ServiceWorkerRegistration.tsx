'use client'

import { useEffect } from 'react'

// Registers the offline service worker (generated into out/sw.js by
// scripts/gen-sw.ts at build time). Production-only: the dev server
// never serves /sw.js, and a worker would only get in the way of HMR.
// After the first visit the whole study tool (pages + build assets)
// works offline; images and data are cached as they're browsed.
//
// Installed home-screen apps only: a normal Safari visitor otherwise
// pays a ~14MB background precache (see sw.template.js) for an offline
// capability they never asked for — real cellular data, even though it
// doesn't block the page. iOS gives the standalone app its own storage
// bucket, so its first launch primes the cache fresh regardless.
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari predates display-mode and exposes this instead.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    if (!isStandalone()) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration failing (private mode, storage pressure) just means
      // no offline support — the site works normally.
    })
  }, [])

  return null
}
