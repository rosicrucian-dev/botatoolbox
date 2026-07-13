import { useEffect, useRef, useState } from 'react'

import {
  BREATH_MAX_SCALE,
  BREATH_MIN_OPACITY,
  BREATH_MIN_SCALE,
  BREATH_MAX_OPACITY,
  opacityForScale,
} from './breathVisual'

export interface BreathPattern {
  inhale: number // seconds; any may be 0
  holdIn: number
  exhale: number
  holdOut: number
}

export type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

interface Segment {
  key: BreathPhase
  label: string
  seconds: number
  scale: number
}

// A zero-length segment is dropped (e.g. all-in / all-out with no holds).
function buildSegments(p: BreathPattern): Array<Segment> {
  const segs: Array<Segment> = [
    { key: 'inhale', label: 'Inhale', seconds: p.inhale, scale: BREATH_MAX_SCALE },
    { key: 'holdIn', label: 'Hold', seconds: p.holdIn, scale: BREATH_MAX_SCALE },
    { key: 'exhale', label: 'Exhale', seconds: p.exhale, scale: BREATH_MIN_SCALE },
    { key: 'holdOut', label: 'Hold', seconds: p.holdOut, scale: BREATH_MIN_SCALE },
  ]
  return segs.filter((s) => s.seconds > 0)
}

export interface BreathSequenceOptions {
  pattern: BreathPattern
  cycles: number
  // Freeze the clock in place; resumes exactly where it left off (no phase
  // re-fire) when cleared.
  paused?: boolean
  // Hold the circle still (fully expanded) instead of animating, while the
  // clock still advances so phases/completion — and their audio — fire.
  reducedMotion?: boolean
  // Fully-exhaled "Get ready" hold before the first inhale; absorbs
  // player-startup churn so the first growth begins exactly once.
  leadInMs?: number
  onComplete?: () => void
  // Fires as each segment begins, with its key and duration in seconds —
  // lets a caller layer audio onto the phase timeline.
  onPhase?: (phase: BreathPhase, seconds: number) => void
}

export interface BreathSequenceState {
  label: string
  cycle: number // 1-based
  totalCycles: number
}

// The clock behind a paced-breath circle, split out from its rendering.
// It writes the animated scale/opacity straight to `elRef` every frame
// (driving them through React state would mean a re-render per frame) and
// returns only the label/cycle, which change at segment boundaries. Timing
// is a pausable rAF clock: each segment interpolates linearly from wherever
// the circle currently is to the segment's target over its duration, and
// "pause" is simply "stop accumulating time". <BreathCircle> owns the
// markup; this owns the motion — so the same clock could drive any view.
export function useBreathSequence(
  elRef: React.RefObject<HTMLElement | null>,
  {
    pattern,
    cycles,
    paused = false,
    reducedMotion = false,
    leadInMs = 700,
    onComplete,
    onPhase,
  }: BreathSequenceOptions,
): BreathSequenceState {
  // Held in refs so the timing effect doesn't restart just because a
  // callback identity — or the paused / reduced-motion flag — changed.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  const onPhaseRef = useRef(onPhase)
  useEffect(() => {
    onPhaseRef.current = onPhase
  }, [onPhase])
  const pausedRef = useRef(paused)
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])
  const reducedRef = useRef(reducedMotion)
  useEffect(() => {
    reducedRef.current = reducedMotion
  }, [reducedMotion])

  const totalCycles = Math.max(1, cycles)
  // Label + cycle only change at segment boundaries, so they stay React
  // state; scale/opacity animate every frame and go straight to the DOM.
  const [meta, setMeta] = useState<{ label: string; cycle: number }>({
    label: 'Get ready',
    cycle: 1,
  })

  const { inhale, holdIn, exhale, holdOut } = pattern

  useEffect(() => {
    const segs = buildSegments({ inhale, holdIn, exhale, holdOut })
    if (segs.length === 0) {
      onCompleteRef.current?.()
      return
    }

    const totalSteps = totalCycles * segs.length

    // step === -1 is the fully-exhaled "Get ready" lead-in hold.
    let step = -1
    let segDurationMs = Math.max(0, leadInMs)
    let elapsedMs = 0
    let startScale = BREATH_MIN_SCALE
    let startOpacity = BREATH_MIN_OPACITY
    let endScale = BREATH_MIN_SCALE
    let endOpacity = BREATH_MIN_OPACITY
    let curScale = BREATH_MIN_SCALE
    let curOpacity = BREATH_MIN_OPACITY
    let raf = 0
    let lastTs = 0

    function apply(scale: number, opacity: number) {
      curScale = scale
      curOpacity = opacity
      const el = elRef.current
      if (!el) return
      // Reduced motion: hold the circle fully expanded (matching the CSS
      // box-breath's reduced-motion override) rather than pulsing.
      if (reducedRef.current) {
        el.style.transform = `scale(${BREATH_MAX_SCALE})`
        el.style.opacity = String(BREATH_MAX_OPACITY)
        return
      }
      el.style.transform = `scale(${scale})`
      el.style.opacity = String(opacity)
    }

    // Set up the next segment. Returns false when the sequence is done, so
    // the caller stops requesting frames.
    function beginStep(next: number): boolean {
      step = next
      if (step >= totalSteps) {
        onCompleteRef.current?.()
        return false
      }
      const seg = segs[step % segs.length]
      startScale = curScale
      startOpacity = curOpacity
      endScale = seg.scale
      endOpacity = opacityForScale(seg.scale)
      segDurationMs = Math.max(1, seg.seconds * 1000)
      elapsedMs = 0
      setMeta({ label: seg.label, cycle: Math.floor(step / segs.length) + 1 })
      onPhaseRef.current?.(seg.key, seg.seconds)
      return true
    }

    apply(BREATH_MIN_SCALE, BREATH_MIN_OPACITY)

    function frame(ts: number) {
      if (!lastTs) lastTs = ts
      const dt = ts - lastTs
      lastTs = ts
      if (!pausedRef.current) elapsedMs += dt

      if (step === -1) {
        // Hold the fully-exhaled state through the lead-in, then start.
        if (elapsedMs >= segDurationMs && !beginStep(0)) return
      } else {
        const t = Math.min(1, elapsedMs / segDurationMs)
        apply(
          startScale + (endScale - startScale) * t,
          startOpacity + (endOpacity - startOpacity) * t,
        )
        if (elapsedMs >= segDurationMs && !beginStep(step + 1)) return
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [inhale, holdIn, exhale, holdOut, totalCycles, leadInMs, elRef])

  return { label: meta.label, cycle: meta.cycle, totalCycles }
}
