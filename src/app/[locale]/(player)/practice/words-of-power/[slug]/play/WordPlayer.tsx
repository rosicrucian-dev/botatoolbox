'use client'

import { useLocaleRouter } from '@/components/locale/LocaleLink'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { SlidePlayer } from '@/components/player/SlidePlayer'
import { SoundButton } from '@/components/player/SoundButton'
import { MajorImage } from '@/components/tarot/CardImage'
import { CHANT_BEAT_SECONDS } from '@/lib/audio/chant'
import { getColor, textColorFor } from '@/lib/colors'
import { type ExpandedWord } from '@/lib/hebrew'
import { useAutoAdvance } from '@/lib/hooks/useAutoAdvance'
import { usePlayerIndex } from '@/lib/hooks/usePlayerIndex'
import { useToneOnIdx } from '@/lib/hooks/useToneOnIdx'
import { useColorPalette } from '@/lib/stores/colorPalette'

// The server page expands the word (letter → card join) so the datasets
// stay out of the client bundle.
export function WordOfPowerPlayer({ word }: { word: ExpandedWord }) {
  const router = useLocaleRouter()
  const searchParams = useSearchParams()
  const autoplay = searchParams.get('autoplay') === '1'
  const { colorPalette: theme } = useColorPalette()
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
        router.push(`/practice/words-of-power/${word.slug}`)
      }
    },
  })

  return (
    <SlidePlayer
      title={word.name}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push(`/practice/words-of-power/${word.slug}`)}
      extraHeaderItem={
        current?.note && !autoplay ? (
          <SoundButton onClick={playCurrent} />
        ) : null
      }
      renderLeft={(slide) =>
        slide.cardSlug && slide.cardName && slide.cardNum != null ? (
          <MajorImage
            card={{ num: slide.cardNum, slug: slide.cardSlug }}
            alt={slide.cardName}
            className="max-h-[33svh] max-w-full object-contain md:max-h-[50vh] md:max-w-[280px]"
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
