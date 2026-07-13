'use client'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { BreathCircle } from '@/components/BreathCircle'
import { SlidePlayer } from '@/components/SlidePlayer'
import { noteToFrequency, playTone } from '@/lib/audio'
import { ensureAudioContext } from '@/lib/audioContext'
import { createBreathTones } from '@/lib/breathTones'
import { stepLabel, useTimerSteps } from '@/lib/timer'
import { useAutoAdvance } from '@/lib/useAutoAdvance'

// A short E rung at each auto-transition — an audible "step changed" cue
// for anyone meditating with their eyes closed. The AudioContext was
// unlocked by the Start-button gesture, so it plays from these timer
// callbacks even though they aren't user gestures.
function ringStepChange() {
  const ctx = ensureAudioContext()
  const freq = noteToFrequency('E')
  if (ctx && freq) playTone(ctx, freq, 0.7)
}

// Three quick E blips at the very end of the sequence — distinct from the
// single per-step ring so a meditator with their eyes closed knows the
// whole timer is finished and can open their eyes. Staggered via playTone's
// startAt so they sound as "beep beep beep" rather than one stacked chord.
function ringFinish() {
  const ctx = ensureAudioContext()
  const freq = noteToFrequency('E')
  if (!ctx || !freq) return
  const gap = 0.2
  const dur = 0.14
  for (let i = 0; i < 3; i++) {
    playTone(ctx, freq, dur, ctx.currentTime + i * gap)
  }
}

// Full-screen player for a built Timer sequence: one slide per step, plus
// a terminal "done" slide. Timer steps count minutes down and
// auto-advance; breath steps run the BreathCircle and advance when they
// finish. The final step advances to the done slide (a checkmark) which
// does not auto-advance — the user leaves via the header's close button.
// Slides carry no per-slide color, so SlidePlayer falls back to its
// white / dark-zinc surface.
export default function TimerPlayPage() {
  const router = useRouter()
  const { steps, hydrated } = useTimerSteps()

  const slides = useMemo(() => {
    if (steps.length === 0) return []
    return [
      ...steps.map((s, i) => ({ label: stepLabel(s, i), kind: 'step' as const })),
      { label: 'Done', kind: 'done' as const },
    ]
  }, [steps])

  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const step = steps[idx]
  const isTimer = step?.kind === 'timer'

  // One scheduler for the whole session; drives the per-phase breath
  // tones on the audio clock and can silence them on skip/close. A
  // useState lazy initializer gives a single stable instance.
  const [tones] = useState(createBreathTones)

  // No steps once hydration settles (direct navigation, cleared storage):
  // bounce back to the builder.
  useEffect(() => {
    if (hydrated && steps.length === 0) router.replace('/timer')
  }, [hydrated, steps.length, router])

  // Kill any scheduled breath tones when the player unmounts (close).
  useEffect(() => () => tones.cancel(), [tones])

  // Always step forward; from the last real step this lands on the done
  // slide, which never calls advance, so the sequence rests there. Each
  // auto-transition rings E — the done slide never advances, so no cue
  // plays after it.
  function advance() {
    tones.cancel()
    // Completing the last real step lands on the done slide — mark that
    // with the distinct triple beep instead of the single per-step ring.
    if (idx >= steps.length - 1) ringFinish()
    else ringStepChange()
    setIdx((i) => Math.min(i + 1, slides.length - 1))
  }

  // Drives the minutes countdown for timer steps; disabled on breath and
  // done slides (BreathCircle owns its own completion). Returns the
  // seconds left for the current slide so the UI can render minutes.
  const timeRemaining = useAutoAdvance({
    duration: step?.kind === 'timer' ? Math.max(1, step.minutes) * 60 : 0,
    idx,
    enabled: isTimer,
    paused,
    onAdvance: advance,
  })

  if (slides.length === 0) return null

  return (
    <SlidePlayer
      title="Timer"
      slides={slides}
      idx={idx}
      onIdxChange={(next) => {
        ensureAudioContext()
        tones.cancel()
        setIdx(next)
      }}
      onClose={() => router.push('/timer')}
      renderLeft={() => null}
      renderRight={() => null}
      renderFull={(slide, i) => {
        if (slide.kind === 'done') {
          return (
            <CheckCircleIcon
              aria-label="Done"
              className="size-40 text-emerald-500 md:size-56"
            />
          )
        }
        const s = steps[i]
        if (!s) return null

        // The step's own visual — the minutes digit or the breath circle,
        // each already carrying its subtext (label / cycle counter). The
        // pause control sits below it as a third, quieter layer so the
        // hierarchy reads circle-or-digit → subtext → control.
        let content: React.ReactNode
        if (s.kind === 'timer') {
          const secs = timeRemaining ?? Math.max(1, s.minutes) * 60
          const minutesLeft = Math.max(1, Math.ceil(secs / 60))
          content = (
            <div className="text-center">
              <div className="text-[min(28vh,44vw)] leading-none font-semibold">
                {minutesLeft}
              </div>
              <div className="mt-2 text-lg opacity-60 md:text-xl">
                {minutesLeft === 1 ? 'minute' : 'minutes'} left
              </div>
            </div>
          )
        } else {
          content = (
            <BreathCircle
              // Remount per step so the timing loop restarts cleanly.
              key={s.id}
              pattern={{
                inhale: s.inhale,
                holdIn: s.holdIn,
                exhale: s.exhale,
                holdOut: s.holdOut,
              }}
              cycles={s.cycles}
              paused={paused}
              onComplete={advance}
              onPhase={(phase, seconds) => tones.playPhase(phase, seconds)}
            />
          )
        }

        return (
          <div className="flex flex-col items-center gap-10">
            {content}
            <button
              type="button"
              onClick={() => {
                // A user gesture — a good moment to (re)unlock audio in
                // case autoplay policy suspended the context.
                ensureAudioContext()
                setPaused((p) => !p)
              }}
              aria-label={paused ? 'Resume' : 'Pause'}
              aria-pressed={paused}
              className="inline-flex size-12 items-center justify-center rounded-full text-current opacity-55 ring-1 ring-current/25 transition hover:bg-current/5 hover:opacity-100 md:size-14"
            >
              {paused ? (
                // Nudge the play triangle right so it sits optically
                // centered in the circle.
                <PlayIcon className="size-6 translate-x-px md:size-7" />
              ) : (
                <PauseIcon className="size-6 md:size-7" />
              )}
            </button>
          </div>
        )
      }}
    />
  )
}
