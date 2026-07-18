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

// One card's slide data, prepared by the server page (localized name +
// letter glyph joined there so the datasets stay out of the bundle).
export interface MajorArcanaSlideCard {
  num: number
  slug: string
  label: string
  glyph: string
  cardName: string
  note: string
  color: string
}

export function MajorArcanaPlayClient({
  cards,
}: {
  cards: ReadonlyArray<MajorArcanaSlideCard>
}) {
  const { t } = useT()
  const router = useLocaleRouter()
  const { colorPalette: theme } = useColorPalette()
  // The palette lookup stays client-side — the theme is a client store.
  const slides = useMemo(
    () =>
      cards.map((c) => ({
        ...c,
        bgColor: getColor(c.color, theme),
        textColor: textColorFor(c.color),
      })),
    [cards, theme],
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
      title={t('player.majorArcana.title')}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      // Close → current card's detail page. Matches the Astrology
      // Focus pattern: "close lands you on the thing you were just
      // meditating on", regardless of whether you entered from the list
      // or from a different card's detail.
      onClose={() => {
        if (current) router.push(`/tarot/${current.slug}`)
        else router.push('/tarot/major-arcana')
      }}
      extraHeaderItem={
        current?.note ? <SoundButton onClick={playCurrent} /> : null
      }
      // Focus on the card alone — no Hebrew-letter half. renderFull
      // replaces the two-pane split with a single centered pane, so the
      // card sits in the middle of the screen.
      renderLeft={() => null}
      renderRight={() => null}
      renderFull={(slide) => (
        <MajorImage
          card={{ num: slide.num, slug: slide.slug }}
          alt={slide.cardName}
          className="max-h-[65svh] max-w-full object-contain md:max-h-[72vh] md:max-w-[360px]"
        />
      )}
    />
  )
}
