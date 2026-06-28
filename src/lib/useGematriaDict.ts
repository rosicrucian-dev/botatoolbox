import { useEffect, useState } from 'react'

import { fetchGematriaDict, type GematriaDict } from '@/content/data/gematria-words'

// Fetch the (large, non-bundled) gematria dictionary on mount and cache it for
// the session. Returns null until it's loaded, so callers can show a pending
// state. SSR-safe: the fetch only runs in the effect, on the client.
export function useGematriaDict(): GematriaDict | null {
  const [dict, setDict] = useState<GematriaDict | null>(null)
  useEffect(() => {
    let alive = true
    fetchGematriaDict()
      .then((d) => {
        if (alive) setDict(d)
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
