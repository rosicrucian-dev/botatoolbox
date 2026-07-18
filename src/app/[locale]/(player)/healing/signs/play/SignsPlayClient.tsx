'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useT } from '@/content/messages/useT'
import { useMemo } from 'react'

import { MajorImage } from '@/components/CardImage'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import { useColorPalette } from '@/lib/colorPalette'
import { getColor, textColorFor } from '@/lib/colors'
import { usePlayerIndex } from '@/lib/usePlayerIndex'
import { useToneOnIdx } from '@/lib/useToneOnIdx'

// One sign's slide data, prepared by the server page (sign + tarot-card
// join done there so the datasets stay out of the bundle).
export interface SignSlideData {
  label: string
  bodyPart?: string
  glyph: string
  note?: string
  color?: string
  cardNum?: number
  cardSlug?: string
  cardName?: string
}

export function SignsPlayClient({
  signs,
}: {
  signs: ReadonlyArray<SignSlideData>
}) {
  const { t } = useT()
  const router = useLocaleRouter()
  const { colorPalette: theme } = useColorPalette()
  // The palette lookup stays client-side — the theme is a client store.
  const slides = useMemo(
    () =>
      signs.map((s) => ({
        ...s,
        bgColor: getColor(s.color, theme),
        textColor: textColorFor(s.color),
      })),
    [signs, theme],
  )
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
      title={t('player.healing.signsTitle')}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push('/healing/signs')}
      extraHeaderItem={
        current?.note ? <SoundButton onClick={playCurrent} /> : null
      }
      renderLeft={(slide) =>
        slide.cardSlug ? (
          <MajorImage
            card={{ num: slide.cardNum!, slug: slide.cardSlug }}
            alt={slide.cardName}
            className="max-h-[33svh] max-w-full object-contain md:max-h-[50vh] md:max-w-[280px]"
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
                {t('player.healing.intone')}
              </div>
            </>
          )}
        </div>
      )}
    />
  )
}
