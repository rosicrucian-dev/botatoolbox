'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

// The calculator moved to /gematria/calculator. Keep this old path alive as a
// client-side redirect (static export has no server redirects) so bookmarks —
// and the player's older ?seq= back-links — still land on the calculator.
function GematriaRedirect() {
  const router = useRouter()
  const sp = useSearchParams()

  useEffect(() => {
    const qs = sp.toString()
    router.replace(`/gematria/calculator${qs ? `?${qs}` : ''}`)
  }, [router, sp])

  return null
}

export default function GematriaIndexPage() {
  return (
    <Suspense>
      <GematriaRedirect />
    </Suspense>
  )
}
