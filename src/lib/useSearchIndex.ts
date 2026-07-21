import { useCallback, useEffect, useState } from 'react'

import {
  fetchIndex,
  type CollectionSearchIndex,
} from '@/lib/collection-search'

// Fetch a collection's search index on mount and cache it (per URL) for the
// session. SSR-safe: the fetch only runs in the effect, on the client. Mirrors
// useGematriaDict — status lets the dialog show loading vs. an error + retry.
export type SearchIndexState =
  | { status: 'loading'; index: null }
  | { status: 'ready'; index: CollectionSearchIndex }
  | { status: 'error'; index: null }

export function useSearchIndex(url: string): SearchIndexState & {
  retry: () => void
} {
  const [state, setState] = useState<SearchIndexState>({
    status: 'loading',
    index: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    fetchIndex(url)
      .then((index) => {
        if (alive) setState({ status: 'ready', index })
      })
      .catch(() => {
        if (alive) setState({ status: 'error', index: null })
      })
    return () => {
      alive = false
    }
  }, [url, attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading', index: null })
    setAttempt((a) => a + 1)
  }, [])

  return { ...state, retry }
}
