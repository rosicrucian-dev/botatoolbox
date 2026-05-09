'use client'

import { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { ensureAudioContext } from '@/lib/audioContext'

interface Options {
  slidesLength: number
  // Query-param name to read for the starting index. Defaults to 'idx'.
  paramName?: string
  // Optional transform from the raw query value to the actual starting
  // index — used by Planets which has a setup card at idx=0 and offsets
  // the rest by one.
  transformIdx?: (raw: number) => number
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
export function usePlayerIndex({
  slidesLength,
  paramName = 'idx',
  transformIdx,
}: Options): PlayerIndex {
  const sp = useSearchParams()
  const raw = Number(sp.get(paramName) ?? '0')
  const transformed = transformIdx ? transformIdx(raw) : raw
  const startIdx = Math.max(0, Math.min(slidesLength - 1, transformed))

  const [idx, setIdx] = useState(startIdx)

  const handleIdxChange = useCallback((next: number) => {
    ensureAudioContext()
    setIdx(next)
  }, [])

  return { idx, setIdx, handleIdxChange }
}
