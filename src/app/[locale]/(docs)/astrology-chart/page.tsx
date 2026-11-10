'use client'

import { useEffect } from 'react'

import {
  PlainLink as Link,
  useLocaleRouter,
} from '@/components/locale/LocaleLink'

// The chart moved to /astrology/chart when the Astrology nav category
// was added (July 2026), and up to /astrology when that category became
// one row of Tools (November 2026). The static export can't emit real
// 301s, so this stub keeps old bookmarks working with a client-side
// redirect — pointed at the CURRENT address, never at the other stub.
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
