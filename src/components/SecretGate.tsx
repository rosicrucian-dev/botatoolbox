'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useEffect, type ReactNode } from 'react'

import { useSecretMode } from '@/lib/useSecretMode'

// Client-side gate for routes that require secret mode. Wrapping a
// layout in this means: locked visitors get bounced to /settings (where
// the unlock form lives); unlocked visitors see the children normally.
// This is casual obscurity — the underlying HTML is still in the static
// export — but it's enough friction for accidental visitors.
export function SecretGate({ children }: { children: ReactNode }) {
  const { unlocked, hydrated } = useSecretMode()
  const router = useLocaleRouter()

  useEffect(() => {
    if (hydrated && !unlocked) router.replace('/settings')
  }, [hydrated, unlocked, router])

  // Render nothing until we've checked. Avoids the gated content
  // flashing in for one frame before the redirect kicks in.
  if (!hydrated || !unlocked) return null
  return <>{children}</>
}
