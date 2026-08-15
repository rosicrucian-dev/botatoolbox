'use client'

import { useEffect, useRef, useState } from 'react'

import { MajorImage } from '@/components/CardImage'
import type { TarotCard } from '@/content/data'
import { noteToFrequency, playTone, type ActiveTone } from '@/lib/audio'
import { ensureAudioContext } from '@/lib/audioContext'

const TONE_DURATION = 30

// Cards come from the server parent's getTarot(locale) so card names
// (alt text) localize without bundling the data client-side.
export function TarotKeyboard({ cards }: { cards: ReadonlyArray<TarotCard> }) {
  const fool = cards.find((c) => c.num === 0)!
  const tableau = cards.filter((c) => c.num !== 0)
  const activeRef = useRef<ActiveTone | null>(null)
  const [pressed, setPressed] = useState<string | null>(null)

  useEffect(
    () => () => {
      activeRef.current?.stop()
    },
    [],
  )

  function startTone(slug: string, note: string) {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const freq = noteToFrequency(note)
    if (!freq) return
    activeRef.current?.stop()
    activeRef.current = playTone(ctx, freq, TONE_DURATION)
    setPressed(slug)
  }

  function stopTone() {
    activeRef.current?.stop()
    activeRef.current = null
    setPressed(null)
  }

  return (
    <div className="grid grid-cols-7 gap-1 md:gap-3">
      <div className="col-span-7 grid grid-cols-7 gap-1 md:gap-3">
        <div className="col-start-4">
          <CardButton
            card={fool}
            pressed={pressed === fool.slug}
            onStart={() => startTone(fool.slug, fool.note)}
            onStop={stopTone}
          />
        </div>
      </div>
      {tableau.map((card) => (
        <CardButton
          key={card.num}
          card={card}
          pressed={pressed === card.slug}
          onStart={() => startTone(card.slug, card.note)}
          onStop={stopTone}
        />
      ))}
    </div>
  )
}

function CardButton({
  card,
  pressed,
  onStart,
  onStop,
}: {
  card: TarotCard
  pressed: boolean
  onStart: () => void
  onStop: () => void
}) {
  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
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
      style={{ WebkitTapHighlightColor: 'transparent' }}
      className={`block w-full touch-none transition ${
        pressed ? 'brightness-90' : 'hover:opacity-90'
      }`}
    >
      <MajorImage
        card={card}
        thumb
        alt={`${card.num}. ${card.name}`}
        width={362}
        height={600}
        loading="lazy"
        className="w-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
      />
    </button>
  )
}
