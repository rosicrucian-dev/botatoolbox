'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { signs } from '@/content/data'
import { cardByLetter, cardImage } from '@/content/data/tarot'
import { getLetterMeta } from '@/lib/hebrew'
import { useToneOnIdx } from '@/lib/useToneOnIdx'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import { getColor, textColorFor, type ThemeId } from '@/lib/colors'
import { useColorTheme } from '@/lib/colorTheme'
import { usePlayerIndex } from '@/lib/usePlayerIndex'

const signData = signs.map((s) => {
  const meta = getLetterMeta(s.letter)
  const card = cardByLetter[s.letter]
  return {
    label: s.name,
    bodyPart: s.bodyPart,
    glyph: meta.glyph,
    note: card?.note,
    color: card?.color,
    cardImage: card ? cardImage(card) : undefined,
    cardName: card?.name,
  }
})

function buildSlides(theme: ThemeId) {
  return signData.map((s) => ({
    ...s,
    bgColor: getColor(s.color, theme),
    textColor: textColorFor(s.color),
  }))
}

export default function SignsPlayPage() {
  const router = useRouter()
  const { colorTheme: theme } = useColorTheme()
  const slides = useMemo(() => buildSlides(theme), [theme])
  const { idx, handleIdxChange } = usePlayerIndex({
    slidesLength: slides.length,
  })
  const current = slides[idx]

  const { playCurrent } = useToneOnIdx({
    note: current?.note,
    idx,
    autoplay: false,
  })

  return (
    <SlidePlayer
      title="Signs"
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push('/healing/signs')}
      extraHeaderItem={
        current?.note ? <SoundButton onClick={playCurrent} /> : null
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
          <div className="font-serif text-[min(10vh,28vw)] leading-none font-semibold md:text-[min(20vh,40vw)]">
            IAO
          </div>
          {slide.bodyPart && (
            <>
              <div className="mt-4 text-lg font-medium md:text-xl">
                {slide.bodyPart}
              </div>
              <div className="mt-6 text-sm italic opacity-70 md:text-base">
                Intone three times
              </div>
            </>
          )}
        </div>
      )}
    />
  )
}
