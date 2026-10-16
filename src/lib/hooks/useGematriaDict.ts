import { useCallback, useEffect, useState } from 'react'

import {
  fetchGematriaDict,
  type GematriaDict,
} from '@/content/data/gematria-words'

// Fetch the (large, non-bundled) gematria dictionary on mount and cache it for
// the session. SSR-safe: the fetch only runs in the effect, on the client.
//
// Returns the load status alongside the dict so callers can tell "still
// loading" from "failed" — the asset is ~1.6 MB, so a flaky connection is a
// real case — and offer a retry. fetchGematriaDict doesn't cache failures, so
// retry() genuinely refetches.
export type GematriaDictState =
  | { status: 'loading'; dict: null }
  | { status: 'ready'; dict: GematriaDict }
  | { status: 'error'; dict: null }

export function useGematriaDict(): GematriaDictState & { retry: () => void } {
  const [state, setState] = useState<GematriaDictState>({
    status: 'loading',
    dict: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    fetchGematriaDict()
      .then((d) => {
        if (alive) setState({ status: 'ready', dict: d })
      })
      .catch(() => {
        if (alive) setState({ status: 'error', dict: null })
      })
    return () => {
      alive = false
    }
  }, [attempt])

  const retry = useCallback(() => {
    // Flip back to loading synchronously (outside the effect) so the UI
    // doesn't flash the error state while the refetch starts.
    setState({ status: 'loading', dict: null })
    setAttempt((a) => a + 1)
  }, [])

  return { ...state, retry }
}
