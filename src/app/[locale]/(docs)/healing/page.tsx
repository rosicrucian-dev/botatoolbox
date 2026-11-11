'use client'

import { useEffect } from 'react'

import {
  PlainLink as Link,
  useLocaleRouter,
} from '@/components/locale/LocaleLink'

// /healing was the Healing group's landing, a card each for the planets
// and the signs. They are two of the Meditations now (src/lib/navData.ts)
// and keep their own /healing/ URLs, which is what the practice is
// called; this page has nothing left to list, so it sends old bookmarks
// to the group that holds them. A client-side redirect, as every stub
// here is — the static export can't emit a 301.
export default function HealingRedirect() {
  const router = useLocaleRouter()
  useEffect(() => {
    router.replace('/meditations')
  }, [router])
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      The healing meditations are under{' '}
      <Link
        href="/meditations"
        className="text-emerald-500 underline hover:text-emerald-600"
      >
        Meditations
      </Link>
      .
    </p>
  )
}
