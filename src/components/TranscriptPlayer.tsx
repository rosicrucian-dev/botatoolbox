'use client'

// Interactive transcript: a lecture player plus its paragraphs, where clicking
// a paragraph seeks the audio to that paragraph's start and plays, and the
// paragraph currently being spoken is highlighted as the audio advances.
// Timing comes from content/data/recordings-timings.json (see
// gen-recordings-timings). Used only when timings exist for a recording;
// otherwise the detail page falls back to RecordingPlayer + TranscriptBody.
//
// The transcript is memoized so the once-a-second player tick doesn't re-render
// it. Both the #q= search highlight AND the play-along highlight are applied
// imperatively to that stable DOM — the former wraps matched text in <mark>,
// the latter toggles a class on the active <p> — so they never fight React or
// each other.

import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'

import { Prose } from '@/components/Prose'
import { useHighlightQuery } from '@/components/useHighlightQuery'

// Classes toggled on the currently-playing paragraph. Kept as literal strings
// so Tailwind's content scan generates them.
const ACTIVE_CLASSES = ['bg-emerald-100', 'dark:bg-emerald-400/20']

function fmt(sec: number): string {
  if (!Number.isFinite(sec)) return '0:00'
  const s = Math.floor(sec % 60)
  const m = Math.floor(sec / 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const Transcript = memo(function Transcript({
  containerRef,
  paragraphs,
  starts,
  onJump,
  interactive,
}: {
  containerRef: RefObject<HTMLDivElement | null>
  paragraphs: string[]
  starts: number[]
  onJump: (sec: number) => void
  interactive: boolean
}) {
  useHighlightQuery(containerRef, paragraphs)
  return (
    <Prose>
      <div ref={containerRef}>
        {paragraphs.map((p, i) =>
          interactive ? (
            <p
              key={i}
              data-para={i}
              role="button"
              tabIndex={0}
              title={`Play from ${fmt(starts[i])}`}
              onClick={() => onJump(starts[i])}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onJump(starts[i])
                }
              }}
              className="-mx-2 cursor-pointer rounded-md px-2 transition-colors hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none dark:hover:bg-emerald-400/10 dark:focus:bg-emerald-400/10"
            >
              {p}
            </p>
          ) : (
            <p key={i}>{p}</p>
          ),
        )}
      </div>
    </Prose>
  )
})

export function TranscriptPlayer({
  src,
  durationSeconds = 0,
  paragraphs,
  starts,
}: {
  src: string
  durationSeconds?: number
  paragraphs: string[]
  starts: number[]
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(durationSeconds)
  // Whether playback has ever begun. Before it has, nothing is highlighted —
  // the initial (current === 0) state would otherwise light up paragraph 1,
  // making it look selected rather than plainly clickable.
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = audioRef.current
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

  // Index of the paragraph currently being spoken: the last whose start ≤ now.
  const activeIndex = useMemo(() => {
    let idx = -1
    for (let i = 0; i < starts.length; i++) {
      if (starts[i] <= current) idx = i
      else break
    }
    return idx
  }, [starts, current])

  // Move the highlight whenever the active paragraph changes — imperatively, so
  // the memoized transcript DOM and its #q= marks stay intact. (No auto-scroll.)
  const prevActive = useRef(-1)
  useEffect(() => {
    const container = containerRef.current
    if (!container || !src) return
    if (prevActive.current >= 0) {
      container
        .querySelector(`[data-para="${prevActive.current}"]`)
        ?.classList.remove(...ACTIVE_CLASSES)
      prevActive.current = -1
    }
    // Nothing is highlighted until playback has begun.
    if (!started || activeIndex < 0) return
    container
      .querySelector(`[data-para="${activeIndex}"]`)
      ?.classList.add(...ACTIVE_CLASSES)
    prevActive.current = activeIndex
  }, [activeIndex, started, src])

  const jumpTo = useCallback((sec: number) => {
    const el = audioRef.current
    if (!el) return
    el.currentTime = sec
    setCurrent(sec)
    void el.play()
    setPlaying(true)
    setStarted(true)
  }, [])

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      void el.play()
      setPlaying(true)
      setStarted(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = audioRef.current
    if (!el) return
    el.currentTime = Number(e.target.value)
    setCurrent(el.currentTime)
  }

  return (
    <div className="space-y-6">
      {src ? (
        <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 rounded-lg border border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
          <audio ref={audioRef} src={src} preload="none" />
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
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Audio for this recording isn’t available yet.
        </div>
      )}
      <Transcript
        containerRef={containerRef}
        paragraphs={paragraphs}
        starts={starts}
        onJump={jumpTo}
        interactive={Boolean(src)}
      />
    </div>
  )
}
