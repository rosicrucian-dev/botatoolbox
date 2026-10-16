import { useEffect, useRef, useState } from 'react'

interface Options {
  duration: number
  idx: number
  enabled: boolean
  // While true the countdown holds at its current remaining time; it
  // resumes from there (not from the top) when this flips back to false.
  paused?: boolean
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
  paused = false,
  onAdvance,
}: Options): number | null {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const onAdvanceRef = useRef(onAdvance)

  useEffect(() => {
    onAdvanceRef.current = onAdvance
  }, [onAdvance])

  // Seconds still to run for the current step. Reset to the full duration
  // only when the step actually changes (a new idx/duration/enabled), but
  // carried across a pause so resuming continues from where it stopped —
  // toggling `paused` re-runs this effect without touching the budget.
  const remainingRef = useRef(duration)
  const stepKeyRef = useRef<string | null>(null)

  useEffect(() => {
    const stepKey = `${idx}:${duration}:${enabled}`
    if (stepKeyRef.current !== stepKey) {
      stepKeyRef.current = stepKey
      remainingRef.current = duration
      setTimeRemaining(enabled ? duration : null)
    }

    if (!enabled || paused) return

    const budget = remainingRef.current
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const remaining = Math.max(0, budget - elapsed)
      remainingRef.current = remaining
      setTimeRemaining(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onAdvanceRef.current?.()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [idx, enabled, duration, paused])

  return timeRemaining
}
