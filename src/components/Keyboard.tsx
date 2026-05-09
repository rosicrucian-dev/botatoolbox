'use client'

import { useEffect, useRef, useState } from 'react'

import { keys, type Key } from '@/lib/keyboard'
import { ensureAudioContext } from '@/lib/audioContext'
import { noteToFrequency, playTone, type ActiveTone } from '@/lib/audio'
import { useColorTheme } from '@/lib/colorTheme'
import { getColor, type ThemeId } from '@/lib/colors'

// Black keys overlay the white-key boundaries. The five black notes
// (C#, D#, F#, G#, A#) sit at boundaries 1/7, 2/7, 4/7, 5/7, 6/7 of
// the keyboard width respectively (skipping E-F and B-C). Each black
// key is 60% the width of a white key, centered on its boundary.
const BLACK_KEY_WIDTH_PCT = (0.6 / 7) * 100
const BLACK_KEY_LEFT: Record<string, number> = {
  'C#': (1 / 7) * 100 - BLACK_KEY_WIDTH_PCT / 2,
  'D#': (2 / 7) * 100 - BLACK_KEY_WIDTH_PCT / 2,
  'F#': (4 / 7) * 100 - BLACK_KEY_WIDTH_PCT / 2,
  'G#': (5 / 7) * 100 - BLACK_KEY_WIDTH_PCT / 2,
  'A#': (6 / 7) * 100 - BLACK_KEY_WIDTH_PCT / 2,
}

// Long enough that user release wins in normal play, short enough that
// a missed release event doesn't drone forever. Release fades naturally
// at the end via playTone's release envelope.
const TONE_DURATION = 30

export function Keyboard() {
  const { colorTheme } = useColorTheme()
  const activeRef = useRef<ActiveTone | null>(null)
  const [pressed, setPressed] = useState<string | null>(null)

  useEffect(
    () => () => {
      activeRef.current?.stop()
    },
    [],
  )

  function startTone(note: string) {
    const ctx = ensureAudioContext()
    if (!ctx) return
    activeRef.current?.stop()
    const freq = noteToFrequency(note)
    if (!freq) return
    activeRef.current = playTone(ctx, freq, TONE_DURATION)
    setPressed(note)
  }

  function stopTone() {
    activeRef.current?.stop()
    activeRef.current = null
    setPressed(null)
  }

  const whiteKeys = keys.filter((k) => k.isWhite)
  const blackKeys = keys.filter((k) => !k.isWhite)

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: '7 / 4' }}
    >
      <div className="flex h-full">
        {whiteKeys.map((k) => (
          <KeyButton
            key={k.note}
            keyData={k}
            theme={colorTheme}
            pressed={pressed === k.note}
            isWhite
            onStart={() => startTone(k.note)}
            onStop={stopTone}
          />
        ))}
      </div>

      {blackKeys.map((k) => (
        <div
          key={k.note}
          className="absolute top-0 z-10"
          style={{
            left: `${BLACK_KEY_LEFT[k.note]}%`,
            width: `${BLACK_KEY_WIDTH_PCT}%`,
            height: '62%',
          }}
        >
          <KeyButton
            keyData={k}
            theme={colorTheme}
            pressed={pressed === k.note}
            isWhite={false}
            onStart={() => startTone(k.note)}
            onStop={stopTone}
          />
        </div>
      ))}
    </div>
  )
}

function KeyButton({
  keyData,
  theme,
  pressed,
  isWhite,
  onStart,
  onStop,
}: {
  keyData: Key
  theme: ThemeId
  pressed: boolean
  isWhite: boolean
  onStart: () => void
  onStop: () => void
}) {
  const bg = getColor(keyData.color, theme) ?? '#888'

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    // setPointerCapture keeps subsequent pointer events targeted at this
    // button even if the finger / mouse drifts onto an adjacent key —
    // important for press-and-hold sustain to work without the tone
    // cutting out.
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    onStart()
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    onStop()
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLButtonElement>) {
    // Leaving while still captured shouldn't fire stop (capture means we
    // own the pointer). Only stop on leave if capture was somehow lost.
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      onStop()
    }
  }

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={onStop}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        background: bg,
        WebkitTapHighlightColor: 'transparent',
      }}
      className={`h-full w-full touch-none select-none transition-[filter,transform] duration-75 ${
        isWhite
          ? 'rounded-b-md ring-1 ring-zinc-300 dark:ring-zinc-600'
          : 'rounded-b-md shadow-md ring-1 ring-zinc-900/40'
      } ${pressed ? 'origin-top scale-y-[0.985] brightness-90' : ''}`}
    />
  )
}
