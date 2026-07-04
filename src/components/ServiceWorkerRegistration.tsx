'use client'

import { useEffect } from 'react'

// Registers the offline service worker (generated into out/sw.js by
// scripts/gen-sw.ts at build time). Production-only: the dev server
// never serves /sw.js, and a worker would only get in the way of HMR.
// After the first visit the whole study tool (pages + build assets)
// works offline; images and data are cached as they're browsed.
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration failing (private mode, storage pressure) just means
      // no offline support — the site works normally.
    })
  }, [])

  return null
}
