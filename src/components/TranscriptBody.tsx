'use client'

// Renders a transcript body and, when the URL carries a search term (#q=…,
// set when arriving from the recordings search), highlights every occurrence
// and scrolls the first into view — via the shared useHighlightQuery hook.

import { useRef } from 'react'

import { Prose } from '@/components/Prose'
import { useHighlightQuery } from '@/components/useHighlightQuery'

export function TranscriptBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useHighlightQuery(ref, html)

  return (
    <Prose>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
    </Prose>
  )
}
