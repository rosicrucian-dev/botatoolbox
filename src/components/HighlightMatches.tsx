'use client'

// Client wrapper that highlights the #q= search term inside server-rendered
// children. The highlight logic itself lives in the shared useHighlightQuery
// hook.

import { useRef } from 'react'

import { useHighlightQuery } from '@/lib/use-highlight-query'

export function HighlightMatches({
  children,
  dep,
  className,
}: {
  children: React.ReactNode
  /** Re-run the highlight pass when this changes (e.g. the chapter slug). */
  dep?: unknown
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useHighlightQuery(ref, { dep })
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
