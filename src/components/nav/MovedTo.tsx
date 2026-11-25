'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import {
  PlainLink as Link,
  useLocaleRouter,
  useLocalizedHref,
} from '@/components/locale/LocaleLink'

// A PAGE THAT HAS MOVED. botatoolbox is a static export (`output:
// 'export'`), so it cannot emit a 301: every address this site retires
// keeps a stub that redirects in the browser and says where the thing
// went for anyone who arrives with JavaScript off. There were four of
// these written out by hand, and the November 2026 regrouping made
// sixteen more, so the shape is one component now.
//
// `to` is always the CURRENT address, never another stub — two
// redirects in a row is a flicker and a broken back button, and a
// crawler follows a chain less willingly than one hop.
// `test/seo.test.ts` fails on a stub that points at a stub.
//
// THE REDIRECT IS IN THE HTML TOO (25 November 2026): an instant
// `<meta http-equiv="refresh">`, which is the nearest a static file
// gets to a 301 and is what Google reads as a permanent redirect. The
// script alone left a crawler holding a page with a 200, the site's
// bare title and one sentence. React lifts the tag into <head>. A
// `keepQuery` stub goes without it: the tag cannot carry the query
// string, and it would win the race against the script that can.

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
  verb = 'has moved to',
  keepQuery,
}: {
  /** Where it lives now. */
  to: string
  /** What moved, as the sentence names it ("The chart"). */
  what: string
  /** What to call the destination; the address itself by default. */
  label?: string
  /**
   * What happened to it. The default says it moved, which is the usual
   * case; a page that was RETIRED rather than moved says so instead,
   * because sending a reader to a page that does not hold the thing
   * and calling it the move is worse than a 404.
   */
  verb?: string
  /** Carry the query string across (a shared or saved state). */
  keepQuery?: boolean
}) {
  const localized = useLocalizedHref()
  return (
    <>
      {!keepQuery && (
        <meta httpEquiv="refresh" content={`0; url=${localized(to)}/`} />
      )}
      <Suspense>
        <Redirect to={to} keepQuery={keepQuery} />
      </Suspense>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {what} {verb}{' '}
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
