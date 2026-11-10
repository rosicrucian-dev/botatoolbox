'use client'

import { useEffect } from 'react'

import {
  PlainLink as Link,
  useLocaleRouter,
} from '@/components/locale/LocaleLink'

// The chart moved up to /astrology when the Astrology group became one
// row of Tools (November 2026) — the tool's own href is its first view.
// The static export can't emit real 301s, so this stub keeps old
// bookmarks working with a client-side redirect, as /astrology-chart
// (the move before this one) does.
export default function AstrologyChartRedirect() {
  const router = useLocaleRouter()
  useEffect(() => {
    router.replace('/astrology')
  }, [router])
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      The chart has moved to{' '}
      <Link
        href="/astrology"
        className="text-emerald-500 underline hover:text-emerald-600"
      >
        /astrology
      </Link>
      .
    </p>
  )
}
