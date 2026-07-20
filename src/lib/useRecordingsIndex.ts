import { useCallback, useEffect, useState } from 'react'

import {
  fetchRecordingsIndex,
  type RecordingsSearchIndex,
} from '@/lib/recordings-search'

// Fetch the recordings search index on mount and cache it for the session.
// SSR-safe: the fetch only runs in the effect, on the client. Mirrors
// useGematriaDict — status lets the dialog show loading vs. an error + retry.
export type RecordingsIndexState =
  | { status: 'loading'; index: null }
  | { status: 'ready'; index: RecordingsSearchIndex }
  | { status: 'error'; index: null }

export function useRecordingsIndex(): RecordingsIndexState & {
  retry: () => void
} {
  const [state, setState] = useState<RecordingsIndexState>({
    status: 'loading',
    index: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    fetchRecordingsIndex()
      .then((index) => {
        if (alive) setState({ status: 'ready', index })
      })
      .catch(() => {
        if (alive) setState({ status: 'error', index: null })
      })
    return () => {
      alive = false
    }
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading', index: null })
    setAttempt((a) => a + 1)
  }, [])

  return { ...state, retry }
}
