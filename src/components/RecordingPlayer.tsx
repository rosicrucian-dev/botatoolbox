'use client'

// Minimal native-<audio> player for a lecture recording. Deliberately NOT
// wired through src/lib/audioContext.ts — that's an oscillator/tone manager
// for the meditation players; a plain media element is the right primitive
// for streaming an MP3 (seeking, buffering, OS media controls all for free).
// Audio is served off-repo (R2); when `src` is empty the player shows a
// graceful "coming soon" state so transcript pages work before upload.

import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'

function fmt(sec: number): string {
  if (!Number.isFinite(sec)) return '0:00'
  const s = Math.floor(sec % 60)
  const m = Math.floor(sec / 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function RecordingPlayer({
  src,
  durationSeconds = 0,
}: {
  src: string
  durationSeconds?: number
}) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(durationSeconds)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onTime = () => setCurrent(el.currentTime)
    const onMeta = () => setDuration(el.duration)
    const onEnd = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('ended', onEnd)
    }
  }, [])

  if (!src) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Audio for this recording isn’t available yet.
      </div>
    )
  }

  function toggle() {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      void el.play()
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = ref.current
    if (!el) return
    el.currentTime = Number(e.target.value)
    setCurrent(el.currentTime)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <audio ref={ref} src={src} preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {playing ? (
          <PauseIcon className="size-5" />
        ) : (
          <PlayIcon className="size-5 translate-x-px" />
        )}
      </button>
      <span className="w-11 shrink-0 text-right font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
        {fmt(current)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || durationSeconds || 0}
        value={current}
        onChange={seek}
        aria-label="Seek"
        className="h-1 grow cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-700 dark:accent-zinc-100"
      />
      <span className="w-11 shrink-0 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
        {fmt(duration || durationSeconds)}
      </span>
    </div>
  )
}
