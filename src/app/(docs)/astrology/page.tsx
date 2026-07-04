'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// The signs & planets reference moved to /reference/astrology when the
// reference pages were namespaced under /reference/ (July 2026) —
// /astrology/* now belongs to the Astrology tools (chart, hora). The
// static export can't emit real 301s, so this stub keeps old bookmarks
// working with a client-side redirect.
export default function AstrologyReferenceRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/reference/astrology')
  }, [router])
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Signs &amp; Planets has moved to{' '}
      <Link
        href="/reference/astrology"
        className="text-emerald-500 underline hover:text-emerald-600"
      >
        /reference/astrology
      </Link>
      .
    </p>
  )
}
