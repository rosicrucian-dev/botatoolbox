'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useT } from '@/content/messages/useT'
import { useMemo } from 'react'

import { SlidePlayer } from '@/components/SlidePlayer'
import { TattvaSymbol } from '@/components/TattvaSymbol'
import { getColor } from '@/lib/colors'
import { SUB_ORDER, tattvaByKind, type TattvaKind } from '@/lib/tattvas'
import { usePlayerIndex } from '@/lib/usePlayerIndex'

export function TattvaPlayer({ main }: { main: TattvaKind }) {
  const { t } = useT()
  const router = useLocaleRouter()
  const mainTattva = tattvaByKind[main]

  const slides = useMemo(
    () =>
      SUB_ORDER.map((sub) => ({
        sub,
        bgColor: getColor(mainTattva.flashBg) ?? null,
        textColor: getColor(mainTattva.text) ?? null,
      })),
    [mainTattva],
  )

  const { idx, handleIdxChange } = usePlayerIndex({
    slidesLength: slides.length,
  })

  return (
    <SlidePlayer
      title={t('player.tattva.title')}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push('/reference/tattvas')}
      renderLeft={(slide) => (
        // SlidePlayer's left half is h-[35svh] overflow-hidden on mobile,
        // so the SVG must size by svh (smallest stable viewport height,
        // chrome expanded) — not vh, which is the largest. Capped under
        // 35svh with margin so the symbol never clips in tight viewports
        // like Safari-in-Discord.
        <div className="aspect-square w-[min(30svh,80vw)] md:w-[min(55svh,40vw)]">
          <TattvaSymbol main={main} sub={slide.sub} />
        </div>
      )}
      renderRight={(slide) => (
        <div className="text-center">
          <div className="font-serif text-[min(8svh,18vw)] leading-tight font-semibold md:text-[min(14svh,28vw)]">
            {mainTattva.english}
          </div>
          <div className="mt-2 text-2xl opacity-70 md:text-3xl">
            {tattvaByKind[slide.sub].english}
          </div>
        </div>
      )}
    />
  )
}
