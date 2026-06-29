'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { cards } from '@/content/data/tarot'
import { MajorImage } from '@/components/CardImage'
import { getLetterMeta } from '@/lib/hebrew'
import { useToneOnIdx } from '@/lib/useToneOnIdx'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import { getColor, textColorFor, type ColorPaletteId } from '@/lib/colors'
import { useColorPalette } from '@/lib/colorPalette'
import { usePlayerIndex } from '@/lib/usePlayerIndex'

const cardData = cards.map((c) => {
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

function buildSlides(theme: ColorPaletteId) {
  return cardData.map((c) => ({
    ...c,
    bgColor: getColor(c.color, theme),
    textColor: textColorFor(c.color),
  }))
}

export default function MajorArcanaPlayPage() {
  const router = useRouter()
  const { colorPalette: theme } = useColorPalette()
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
      title="Major Arcana"
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
      renderLeft={(slide) => (
        <MajorImage
          card={{ num: slide.num, slug: slide.slug }}
          alt={slide.cardName}
          className="max-h-[33svh] max-w-full object-contain md:max-h-[50vh] md:max-w-[280px]"
        />
      )}
      renderRight={(slide) => (
        <div
          className="text-center font-serif text-[min(22vh,55vw)] leading-none md:text-[min(40vh,80vw)]"
          dir="rtl"
          lang="he"
        >
          {slide.glyph}
        </div>
      )}
    />
  )
}
