'use client'

import { useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { cardImage } from '@/content/data/tarot'
import { cardByGlyph } from '@/lib/gematria'
import { useToneOnIdx } from '@/lib/useToneOnIdx'
import { useAutoAdvance } from '@/lib/useAutoAdvance'
import { SlidePlayer } from '@/components/SlidePlayer'
import { CHANT_BEAT_SECONDS } from '@/lib/chant'
import { getColor, textColorFor } from '@/lib/colors'
import { useColorTheme } from '@/lib/colorTheme'
import { usePlayerIndex } from '@/lib/usePlayerIndex'

export default function GematriaPlayPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const seqParam = sp.get('seq') ?? ''
  // Round-trip the sequence back to the docs page on close so the user
  // doesn't lose what they typed.
  const backHref = `/resources/gematria${
    seqParam ? `?seq=${encodeURIComponent(seqParam)}` : ''
  }`

  // Each char in seqParam is one glyph (Hebrew is one codepoint per
  // letter). Filter to glyphs we recognize so spaces / unmapped chars
  // don't produce empty silent slides.
  const seq = useMemo(
    () => Array.from(seqParam).filter((g) => cardByGlyph[g]),
    [seqParam],
  )

  const { colorTheme: theme } = useColorTheme()
  const slides = useMemo(
    () =>
      seq.map((glyph) => {
        const card = cardByGlyph[glyph]!
        return {
          glyph,
          note: card.note,
          color: card.color,
          cardImage: cardImage(card),
          cardName: card.name,
          bgColor: getColor(card.color, theme),
          textColor: textColorFor(card.color),
        }
      }),
    [seq, theme],
  )

  // No glyphs to play — bounce back rather than render an empty player.
  useEffect(() => {
    if (slides.length === 0) router.replace(backHref)
  }, [slides.length, router, backHref])

  const { idx, setIdx, handleIdxChange } = usePlayerIndex({
    slidesLength: Math.max(slides.length, 1),
  })
  const current = slides[idx]

  useToneOnIdx({
    note: current?.note,
    idx,
    autoplay: true,
  })

  useAutoAdvance({
    duration: CHANT_BEAT_SECONDS,
    idx,
    enabled: slides.length > 0,
    onAdvance: () => {
      if (idx < slides.length - 1) {
        setIdx(idx + 1)
      } else {
        router.push(backHref)
      }
    },
  })

  return (
    <SlidePlayer
      title="Gematria"
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push(backHref)}
      renderLeft={(slide) => (
        <img
          src={slide.cardImage}
          alt={slide.cardName}
          className="max-h-[33svh] max-w-full rounded-lg object-contain shadow-2xl md:max-h-[50vh] md:max-w-[280px]"
        />
      )}
      renderRight={(slide) => (
        <div className="text-center">
          <div
            className="font-serif text-[min(20vh,50vw)] leading-none md:text-[min(30vh,60vw)]"
            dir="rtl"
            lang="he"
          >
            {slide.glyph}
          </div>
        </div>
      )}
    />
  )
}
