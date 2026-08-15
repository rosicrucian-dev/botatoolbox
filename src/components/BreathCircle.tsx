'use client'

import { useRef } from 'react'

import { BREATH_MIN_OPACITY, BREATH_MIN_SCALE } from '@/lib/breathVisual'
import {
  useBreathSequence,
  type BreathPattern,
  type BreathPhase,
} from '@/lib/useBreathSequence'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

// A configurable paced-breath circle: expands on the inhale, holds, and
// contracts on the exhale, cycling `cycles` times before calling
// `onComplete`. Unlike the hard-coded `animate-breathe` CSS box-breath in
// the Healing/Planets player (a fixed 16s cycle baked into keyframe
// percentages), each segment's duration here is arbitrary. Meant to be
// borrowable by any page that needs a breath guide.
//
// This component is now just the markup + labels: the clock lives in
// `useBreathSequence`, and the look (scale/opacity extremes) in
// `breathVisual`. So the circle no longer owns any timing — it renders
// what the hook drives.

// Re-exported so existing importers (e.g. breathTones) keep resolving these
// from '@/components/BreathCircle'.
export type { BreathPattern, BreathPhase }

interface BreathCircleProps {
  pattern: BreathPattern
  cycles: number
  onComplete?: () => void
  className?: string
  leadInMs?: number
  onPhase?: (phase: BreathPhase, seconds: number) => void
  // Freeze the animation and its clock in place; resumes where it left off.
  paused?: boolean
}

export function BreathCircle({
  pattern,
  cycles,
  onComplete,
  className,
  leadInMs = 700,
  onPhase,
  paused = false,
}: BreathCircleProps) {
  const circleRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { label, cycle, totalCycles } = useBreathSequence(circleRef, {
    pattern,
    cycles,
    paused,
    reducedMotion,
    leadInMs,
    onComplete,
    onPhase,
  })

  return (
    <div className={`flex flex-col items-center gap-8 ${className ?? ''}`}>
      <div
        ref={circleRef}
        aria-label="Breathe with the circle"
        className="size-40 rounded-full bg-current md:size-56"
        // Initial fully-exhaled frame; the hook writes transform/opacity
        // directly from here on.
        style={{
          transform: `scale(${BREATH_MIN_SCALE})`,
          opacity: BREATH_MIN_OPACITY,
        }}
      />
      <div className="text-center">
        {/* All-caps, kept understated: light weight, wide tracking, and
            muted so it reads as a quiet secondary label rather than a
            headline. The leading indent rebalances the trailing
            letter-spacing so the line stays optically centered. */}
        <div className="indent-[0.2em] text-sm font-normal tracking-[0.2em] text-current uppercase opacity-50 md:text-base">
          {label}
        </div>
        <div className="mt-2.5 text-xs tracking-widest opacity-40">
          {cycle} / {totalCycles}
        </div>
      </div>
    </div>
  )
}
