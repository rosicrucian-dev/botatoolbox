'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

// /gematria is now the Gematria group landing page, but older player
// back-links (and bookmarks) point at /gematria?seq=… expecting the
// calculator. Preserve that: when a query string is present, forward to
// /gematria/calculator with it intact. With no query string this renders
// nothing and the group page shows normally.
function Redirect() {
  const router = useLocaleRouter()
  const sp = useSearchParams()

  const qs = sp.toString()
  useEffect(() => {
    if (qs) router.replace(`/gematria/calculator?${qs}`)
  }, [router, qs])

  return null
}

export function GematriaSeqRedirect() {
  return (
    <Suspense>
      <Redirect />
    </Suspense>
  )
}
