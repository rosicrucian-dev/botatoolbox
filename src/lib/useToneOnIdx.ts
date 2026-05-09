import { useCallback, useEffect, useRef } from 'react'

import { noteToFrequency, playTone, type ActiveTone } from './audio'
import { CHANT_BEAT_SECONDS } from './chant'
import { ensureAudioContext, getAudioContext } from './audioContext'

interface Options {
  note?: string | null
  idx: number
  toneDuration?: number
  autoplay?: boolean
}

// Plays a tone for the current stop. If `autoplay` is true, the tone fires
// each time `idx` changes; otherwise tone is only triggered manually via
// the returned `playCurrent` function or the spacebar keyboard shortcut.
//
// playCurrent gets the AudioContext via `ensureAudioContext()` — meaning
// when called from a user gesture (click, keypress) it'll create the
// context if needed; when called from autoplay's useEffect it'll find the
// existing one (created earlier by a PlayLink onClick) or no-op silently.
//
// The active tone is tracked and stopped on idx change / unmount so tones
// don't overlap.
export function useToneOnIdx({
  note,
  idx,
  toneDuration = CHANT_BEAT_SECONDS,
  autoplay = true,
}: Options): { playCurrent: () => void } {
  const activeRef = useRef<ActiveTone | null>(null)

  function stopActive() {
    activeRef.current?.stop()
    activeRef.current = null
  }

  const playCurrent = useCallback(async () => {
    // ensureAudioContext is idempotent. From a user gesture it creates +
    // unlocks. From a non-gesture (autoplay useEffect) it returns the
    // existing singleton if present, otherwise creates one that may not
    // actually emit audio on iOS — but the next user click will heal it.
    let liveCtx = ensureAudioContext() ?? getAudioContext()
    if (liveCtx && liveCtx.state === 'closed') liveCtx = ensureAudioContext()
    if (!liveCtx) return
    // Await resume() before scheduling. Without this, we'd schedule an
    // oscillator while the context is still suspended, and iOS would drop
    // the entire schedule once it actually starts rendering. The audio-
    // permission token from the user gesture carries through this await.
    if (liveCtx.state !== 'running') {
      try {
        await liveCtx.resume()
      } catch {
        return
      }
    }
    stopActive()
    const freq = noteToFrequency(note)
    if (freq) activeRef.current = playTone(liveCtx, freq, toneDuration)
  }, [note, toneDuration])

  // Auto-play on idx change (when enabled). Always stop active tone on
  // cleanup so navigation/unmount silences any in-progress tone.
  useEffect(() => {
    if (autoplay) playCurrent()
    return () => stopActive()
  }, [idx, autoplay, playCurrent])

  // Spacebar replays the current tone. Keypress is a user gesture so
  // playCurrent's internal ensureAudioContext does the right thing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        playCurrent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playCurrent])

  return { playCurrent }
}
