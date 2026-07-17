'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useT } from '@/content/messages/useT'
import { useMemo } from 'react'

import { MajorImage } from '@/components/CardImage'
import { useLocale } from '@/components/LocaleProvider'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import { getTarot } from '@/content/data'
import { useColorPalette } from '@/lib/colorPalette'
import { getColor, textColorFor, type ColorPaletteId } from '@/lib/colors'
import { getLetterMeta } from '@/lib/hebrew'
import { type Locale } from '@/lib/locales'
import { usePlayerIndex } from '@/lib/usePlayerIndex'
import { useToneOnIdx } from '@/lib/useToneOnIdx'

function buildCardData(locale: Locale) {
  const { cards } = getTarot(locale)
  return cards.map((c) => {
    const meta = getLetterMeta(c.letter)
    return {
      num: c.num,
      slug: c.slug,
      label: c.name,
      glyph: meta.glyph,
      cardName: c.name,
      note: c.note,
      color: c.color,
    }
  })
}

function buildSlides(locale: Locale, theme: ColorPaletteId) {
  return buildCardData(locale).map((c) => ({
    ...c,
    bgColor: getColor(c.color, theme),
    textColor: textColorFor(c.color),
  }))
}

export default function MajorArcanaPlayPage() {
  const { t } = useT()
  const router = useLocaleRouter()
  const locale = useLocale()
  const { colorPalette: theme } = useColorPalette()
  const slides = useMemo(() => buildSlides(locale, theme), [locale, theme])
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
