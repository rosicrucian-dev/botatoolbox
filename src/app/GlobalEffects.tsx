'use client'

import { MotionConfig } from 'framer-motion'

import { PermalinkRestore } from '@/components/layout/PermalinkRestore'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration'
import { LastVisitedTracker } from '@/components/nav/LastVisited'

export function GlobalEffects({ children }: { children: React.ReactNode }) {
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
