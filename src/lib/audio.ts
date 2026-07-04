const noteFreqs: Record<string, number> = {
  C: 261.63,
  'C#': 277.18,
  D: 293.66,
  'D#': 311.13,
  E: 329.63,
  F: 349.23,
  'F#': 369.99,
  G: 392.0,
  'G#': 415.3,
  A: 440.0,
  'A#': 466.16,
  B: 493.88,
}

export function noteToFrequency(note?: string | null): number | undefined {
  if (!note) return undefined
  return noteFreqs[note]
}

// Returned by playTone — caller can ramp the tone down early via stop().
export interface ActiveTone {
  stop: () => void
}

export function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
): ActiveTone {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.value = freq

  const now = ctx.currentTime
  const attack = 0.02
  const release = 0.05

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.4, now + attack)
  gain.gain.setValueAtTime(0.4, now + duration - release)
  gain.gain.linearRampToValueAtTime(0, now + duration)

  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration + 0.01)

  return {
    stop() {
      const t = ctx.currentTime
      gain.gain.cancelScheduledValues(t)
      gain.gain.setValueAtTime(gain.gain.value, t)
      gain.gain.linearRampToValueAtTime(0, t + 0.03)
      try {
        osc.stop(t + 0.04)
      } catch {}
    },
  }
}
