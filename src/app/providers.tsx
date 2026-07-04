'use client'

import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from 'next-themes'

import { LastVisitedTracker } from '@/components/LastVisited'
import { PermalinkRestore } from '@/components/PermalinkRestore'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { ThemeColorSync } from '@/components/ThemeColorSync'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      {/* reducedMotion="user": framer-motion animations (mobile nav
          drawer, etc.) collapse to instant changes when the OS asks for
          reduced motion. */}
      <MotionConfig reducedMotion="user">
        <ScrollToTop />
        <ThemeColorSync />
        <ServiceWorkerRegistration />
        <LastVisitedTracker />
        <PermalinkRestore />
        {children}
      </MotionConfig>
    </ThemeProvider>
  )
}
