'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

import { ensureAudioContext } from '@/lib/audioContext'

interface Options {
  slidesLength: number
}

interface PlayerIndex {
  idx: number
  setIdx: (next: number) => void
  // Use this for any user-driven nav (click-to-advance, prev/next buttons,
  // etc.). It primes the AudioContext inside the gesture (so iOS unlocks
  // the audio session) and then updates idx.
  handleIdxChange: (next: number) => void
}

// Bundles the boilerplate every meditation player needs: parse ?idx from
// the query, clamp to slide bounds, hold idx in state, and provide a
// click-handler that primes audio inside the user gesture before
// advancing. Forgetting to prime in the click handler is what causes "no
// sound on first slide change" bugs on iOS.
//
// One player (healing/planets) deliberately does NOT use this hook: its
// idx handler must also reset breath-phase state synchronously in the
// same update, which this fixed handler can't express.
export function usePlayerIndex({ slidesLength }: Options): PlayerIndex {
  const sp = useSearchParams()
  const raw = Number(sp.get('idx') ?? '0')
  const startIdx = Math.max(0, Math.min(slidesLength - 1, raw))

  const [idx, setIdx] = useState(startIdx)

  const handleIdxChange = useCallback((next: number) => {
    ensureAudioContext()
    setIdx(next)
  }, [])

  return { idx, setIdx, handleIdxChange }
}
