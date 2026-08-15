'use client'

import { MotionConfig } from 'framer-motion'

import { LastVisitedTracker } from '@/components/LastVisited'
import { PermalinkRestore } from '@/components/PermalinkRestore'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    /* reducedMotion="user": framer-motion animations (mobile nav
       drawer, etc.) collapse to instant changes when the OS asks for
       reduced motion. Light/dark needs no provider — the dark: variant
       is a prefers-color-scheme media query, so the UI follows the
       system scheme natively. */
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <ServiceWorkerRegistration />
      <LastVisitedTracker />
      <PermalinkRestore />
      {children}
    </MotionConfig>
  )
}
