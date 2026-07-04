'use client'

import { type ReactNode } from 'react'

import { useSecretMode } from '@/lib/useSecretMode'

// Inline gate for a section within an otherwise-public page. Locked
// visitors see nothing — no placeholder, no hint that anything is
// gated. Unlocked visitors see the children. SSR and pre-hydration
// render nothing, then content appears after hydration if unlocked.
export function SecretSection({ children }: { children: ReactNode }) {
  const { unlocked, hydrated } = useSecretMode()
  if (!hydrated || !unlocked) return null
  return <>{children}</>
}
