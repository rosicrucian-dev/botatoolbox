'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { expandWord, type RawWord } from '@/lib/hebrew'
import { useToneOnIdx } from '@/lib/useToneOnIdx'
import { useAutoAdvance } from '@/lib/useAutoAdvance'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import { CHANT_BEAT_SECONDS } from '@/lib/chant'
import { getColor, textColorFor } from '@/lib/colors'
import { useColorTheme } from '@/lib/colorTheme'
import { usePlayerIndex } from '@/lib/usePlayerIndex'

export function WordOfPowerPlayer({ raw }: { raw: RawWord }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoplay = searchParams.get('autoplay') === '1'

  const word = expandWord(raw)
  const { colorTheme: theme } = useColorTheme()
  const slides = useMemo(
    () =>
      word.letters.map((l) => ({
        ...l,
        bgColor: getColor(l.color, theme),
        textColor: textColorFor(l.color),
      })),
    [word.letters, theme],
  )

  const { idx, setIdx, handleIdxChange } = usePlayerIndex({
    slidesLength: slides.length,
  })
  const current = slides[idx]

  const { playCurrent } = useToneOnIdx({
    note: current?.note,
    idx,
    autoplay,
  })

  useAutoAdvance({
    duration: CHANT_BEAT_SECONDS,
    idx,
    enabled: autoplay,
    onAdvance: () => {
      if (idx < slides.length - 1) {
        setIdx(idx + 1)
      } else {
        router.push(`/words-of-power/${word.slug}`)
      }
    },
  })

  return (
    <SlidePlayer
      title={word.name}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push(`/words-of-power/${word.slug}`)}
      extraHeaderItem={
        current?.note && !autoplay ? (
          <SoundButton onClick={playCurrent} />
        ) : null
      }
      renderLeft={(slide) =>
        slide.cardImage ? (
          <img
            src={slide.cardImage}
            alt={slide.cardName}
            className="max-h-[33svh] max-w-full rounded-lg object-contain shadow-2xl md:max-h-[50vh] md:max-w-[280px]"
          />
        ) : null
      }
      renderRight={(slide) => (
        <div className="text-center">
          <div
            className="font-serif text-[min(20vh,50vw)] leading-none md:text-[min(30vh,60vw)]"
            dir="rtl"
            lang="he"
          >
            {slide.glyph}
          </div>
          {slide.pronunciation && (
            <div className="mt-4 text-4xl leading-tight font-medium md:text-5xl">
              {slide.pronunciation}
            </div>
          )}
        </div>
      )}
    />
  )
}
