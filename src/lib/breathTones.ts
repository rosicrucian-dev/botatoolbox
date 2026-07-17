import { noteToFrequency } from './audio'
import { getAudioContext } from './audioContext'

import type { BreathPhase } from '@/components/BreathCircle'

// Tonal guidance for the breath phases, so a meditator can feel in / hold
// / out / hold with their eyes closed. The pitch set is the seven
// classical planetary notes (from their double-letter tarot cards),
// sorted low→high:
//
//   Mars C · Sun D · Mercury E · Venus F# · Moon G# · Saturn A · Jupiter A#
//
// Each phase fires a quick run at its *start* — a signal that a new phase
// has begun, not a sound that fills the whole duration. Inhale runs up the
// scale, exhale runs back down, and each hold gets a single marker tone.
export const PLANET_SCALE = ['C', 'D', 'E', 'F#', 'G#', 'A', 'A#'] as const

const NOTE_STEP = 0.12 // seconds between note onsets — a fast run
const NOTE_DUR = 0.15 // length of each blip
const NOTE_PEAK = 0.26 // gain for the run's blips
const HOLD_PEAK = 0.28

export interface BreathToneController {
  // Schedule the tones for a phase that has just started and lasts
  // `seconds`. Any tones still pending from a previous phase are cancelled.
  playPhase: (phase: BreathPhase, seconds: number) => void
  // Silence everything immediately (step skipped, player closed).
  cancel: () => void
}

// Schedules a single sine blip at an absolute AudioContext time with a
// short attack/release so it doesn't click. Tracked so cancel() can kill
// it even before it has started.
function scheduleBlip(
  ctx: AudioContext,
  active: Set<{ osc: OscillatorNode; gain: GainNode }>,
  freq: number,
  startAt: number,
  dur: number,
  peak: number,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq

  const attack = 0.015
  const release = 0.08
  const holdUntil = Math.max(startAt + attack, startAt + dur - release)
  gain.gain.setValueAtTime(0, startAt)
  gain.gain.linearRampToValueAtTime(peak, startAt + attack)
  gain.gain.setValueAtTime(peak, holdUntil)
  gain.gain.linearRampToValueAtTime(0, startAt + dur)

  osc.connect(gain).connect(ctx.destination)
  osc.start(startAt)
  osc.stop(startAt + dur + 0.02)

  const entry = { osc, gain }
  active.add(entry)
  osc.onended = () => active.delete(entry)
}

export function createBreathTones(): BreathToneController {
  const active = new Set<{ osc: OscillatorNode; gain: GainNode }>()

  function cancel() {
    const ctx = getAudioContext()
    const now = ctx ? ctx.currentTime : 0
    for (const { osc, gain } of active) {
      try {
        gain.gain.cancelScheduledValues(now)
        gain.gain.setValueAtTime(0, now)
      } catch {}
      try {
        osc.stop(now)
      } catch {}
    }
    active.clear()
  }

  function playPhase(phase: BreathPhase, seconds: number) {
    const ctx = getAudioContext()
    if (!ctx || seconds <= 0) return
    cancel()
    const t0 = ctx.currentTime

    // Holds: one short marker tone (capped to the hold's own length).
    if (phase === 'holdIn' || phase === 'holdOut') {
      const note = phase === 'holdIn' ? 'A#' : 'C'
      const freq = noteToFrequency(note)
      if (freq)
        scheduleBlip(ctx, active, freq, t0, Math.min(1, seconds), HOLD_PEAK)
      return
    }

    // Inhale/exhale: a fast run up or down the planetary scale, fired at
    // the phase's start regardless of how long the phase lasts.
    const ascending = phase === 'inhale'
    const n = PLANET_SCALE.length
    for (let i = 0; i < n; i++) {
      const noteIdx = ascending ? i : n - 1 - i
      const freq = noteToFrequency(PLANET_SCALE[noteIdx])
      if (!freq) continue
      scheduleBlip(ctx, active, freq, t0 + i * NOTE_STEP, NOTE_DUR, NOTE_PEAK)
    }
  }

  return { playPhase, cancel }
}
