'use client'

import { useEffect } from 'react'

import { PlainLink as Link, useLocaleRouter } from '@/components/LocaleLink'

// The chart moved to /astrology/chart when the Astrology nav category
// was added (July 2026). The static export can't emit real 301s, so
// this stub keeps old bookmarks working with a client-side redirect.
export default function AstrologyChartRedirect() {
  const router = useLocaleRouter()
  useEffect(() => {
    router.replace('/astrology/chart')
  }, [router])
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      The chart has moved to{' '}
      <Link
        href="/astrology/chart"
        className="text-emerald-500 underline hover:text-emerald-600"
      >
        /astrology/chart
      </Link>
      .
    </p>
  )
}
