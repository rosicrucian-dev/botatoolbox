'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/catalyst/button'
import { isVersionSkewError, recoverFromVersionSkew } from '@/lib/versionSkew'

// Segment error boundary for the docs shell. Renders inside (docs)/layout, so
// the header/sidebar stay put. A stale-build (version-skew) navigation
// self-heals with a single reload; any other error shows a recoverable
// fallback with Try again (re-render the segment) / Reload.
export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Start in the "reloading" state for skew errors so we never flash the
  // "something went wrong" copy for a routine deploy; the effect then performs
  // the guarded reload. If the guard blocks it (the error survived a reload,
  // so it's a real bug) we drop to the visible fallback.
  const [reloading, setReloading] = useState(() => isVersionSkewError(error))

  useEffect(() => {
    if (!isVersionSkewError(error)) return
    if (!recoverFromVersionSkew(error)) setReloading(false)
  }, [error])

  if (reloading) {
    return (
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-16 text-center">
        <p className="text-base text-zinc-600 dark:text-zinc-400">Updating…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
        Something went wrong
      </p>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
        This page hit an error
      </h1>
      <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
        Try again, or reload to get the latest version of the app.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button outline onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </div>
  )
}
