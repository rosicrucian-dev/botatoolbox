'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import {
  PlainLink as Link,
  useLocaleRouter,
} from '@/components/locale/LocaleLink'

// The calculator moved up to /gematria when the Gematria group became
// one row of Tools (November 2026) — the tool's own href is its first
// view. The static export can't emit real 301s, so this stub keeps old
// bookmarks working with a client-side redirect, and carries `?seq=`
// across: a shared or saved spelling is the likeliest thing to arrive
// at the old address.
function Redirect() {
  const router = useLocaleRouter()
  const qs = useSearchParams().toString()
  useEffect(() => {
    router.replace(qs ? `/gematria?${qs}` : '/gematria')
  }, [router, qs])
  return null
}

export default function GematriaCalculatorRedirect() {
  return (
    <>
      <Suspense>
        <Redirect />
      </Suspense>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        The calculator has moved to{' '}
        <Link
          href="/gematria"
          className="text-emerald-500 underline hover:text-emerald-600"
        >
          /gematria
        </Link>
        .
      </p>
    </>
  )
}
