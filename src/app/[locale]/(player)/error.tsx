'use client'

import { ErrorFallback } from '@/components/ui/ErrorFallback'

// Segment error boundary for the full-screen players. Without this a player
// crash falls through to global-error.tsx, which replaces the whole document
// (no chrome, no theme). The players' own layout has no chrome either, so
// the fallback fills the viewport on a plain page background.
export default function PlayerError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-900">
      <ErrorFallback {...props} />
    </div>
  )
}
