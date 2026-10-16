'use client'

// Renders a transcript body and, when the URL carries a search term (?q=…, set
// when arriving from the recordings search), marks every occurrence and scrolls
// the first into view — via the shared useMarkQuery hook.

import { useRef } from 'react'

import { Prose } from '@/components/ui/Prose'
import { RECORDINGS_TOKENIZER, SEARCH_MARK_CLASS } from '@/lib/collectionSearch'
import { useMarkQuery } from '@/lib/search-engine/react/use-mark-query'

export function TranscriptBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useMarkQuery(ref, {
    tokenizer: RECORDINGS_TOKENIZER,
    dep: html,
    className: SEARCH_MARK_CLASS,
  })

  return (
    <Prose>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
    </Prose>
  )
}
