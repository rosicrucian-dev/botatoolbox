import { useEffect, useRef, useState } from 'react'

interface Options {
  duration: number
  idx: number
  enabled: boolean
  onAdvance: () => void
}

// Counts down from `duration` seconds whenever `idx` changes (and `enabled`
// is true). Calls `onAdvance` when the countdown reaches zero. Returns the
// current `timeRemaining` (or null when disabled) so the UI can display it.
//
// `onAdvance` is held in a ref so callers don't have to memoize it — the
// timer never resets just because the callback identity changed.
export function useAutoAdvance({
  duration,
  idx,
  enabled,
  onAdvance,
}: Options): number | null {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const onAdvanceRef = useRef(onAdvance)

  useEffect(() => {
    onAdvanceRef.current = onAdvance
  }, [onAdvance])

  useEffect(() => {
    if (!enabled) {
      setTimeRemaining(null)
      return
    }

    const startTime = Date.now()
    setTimeRemaining(duration)
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const remaining = Math.max(0, Math.min(duration, duration - elapsed))
      setTimeRemaining(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onAdvanceRef.current?.()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [idx, enabled, duration])

  return timeRemaining
}
