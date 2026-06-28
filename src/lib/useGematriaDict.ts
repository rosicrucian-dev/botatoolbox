import { useEffect, useState } from 'react'

import {
  fetchGematriaDict,
  mergeExternalNotes,
  type GematriaDict,
} from '@/content/data/gematria-words'

// Fetch the (large, non-bundled) gematria dictionary on mount and cache it for
// the session. Returns null until it's loaded, so callers can show a pending
// state. SSR-safe: the fetch only runs in the effect, on the client.
//
// Loads in two stages so the page is responsive: first the core dictionary
// (words + small notes), then the multi-MB external notes (the Gematria
// Notebook), which are merged in and trigger a re-render once they land.
export function useGematriaDict(): GematriaDict | null {
  const [dict, setDict] = useState<GematriaDict | null>(null)
  useEffect(() => {
    let alive = true
    fetchGematriaDict()
      .then((d) => {
        if (!alive) return
        setDict(d) // 1) show core content immediately
        return mergeExternalNotes(d).then((merged) => {
          // 2) re-render with the notebook merged in (new ref; entries mutated)
          if (alive) setDict({ ...merged })
        })
      })
      .catch(() => {
        // Leave dict null — the pages degrade to "no definition" rather than
        // erroring. (The file is a static asset; a failure here is unusual.)
      })
    return () => {
      alive = false
    }
  }, [])
  return dict
}
