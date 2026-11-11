'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import {
  PlainLink as Link,
  useLocaleRouter,
} from '@/components/locale/LocaleLink'

// A PAGE THAT HAS MOVED. botatoolbox is a static export (`output:
// 'export'`), so it cannot emit a 301: every address this site retires
// keeps a stub that redirects in the browser and says where the thing
// went for anyone who arrives with JavaScript off. There were four of
// these written out by hand, and the November 2026 regrouping made
// sixteen more, so the shape is one component now.
//
// `to` is always the CURRENT address, never another stub — two
// redirects in a row is a flicker and a broken back button.

function Redirect({ to, keepQuery }: { to: string; keepQuery?: boolean }) {
  const router = useLocaleRouter()
  const qs = useSearchParams().toString()
  useEffect(() => {
    router.replace(keepQuery && qs ? `${to}?${qs}` : to)
  }, [router, to, qs, keepQuery])
  return null
}

export function MovedTo({
  to,
  what,
  label,
  keepQuery,
}: {
  /** Where it lives now. */
  to: string
  /** What moved, as the sentence names it ("The chart"). */
  what: string
  /** What to call the destination; the address itself by default. */
  label?: string
  /** Carry the query string across (a shared or saved state). */
  keepQuery?: boolean
}) {
  return (
    <>
      <Suspense>
        <Redirect to={to} keepQuery={keepQuery} />
      </Suspense>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {what} has moved to{' '}
        <Link
          href={to}
          className="text-emerald-500 underline hover:text-emerald-600"
        >
          {label ?? to}
        </Link>
        .
      </p>
    </>
  )
}
