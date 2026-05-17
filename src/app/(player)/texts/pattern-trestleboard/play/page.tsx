'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { sephirahBySlug, SEPHIROTH_DESCENT_SLUGS } from '@/content/data'
import { SlidePlayer } from '@/components/SlidePlayer'
import { ProgressiveTree } from '@/components/ProgressiveTree'
import { getColor, textColorFor, type ThemeId } from '@/lib/colors'
import { useColorTheme } from '@/lib/colorTheme'
import { statements } from '@/content/texts/pattern-trestleboard'
import { usePlayerIndex } from '@/lib/usePlayerIndex'

function buildSlides(theme: ThemeId) {
  // Statement N+1 pairs with the Nth sephirah in tree-descent order
  // (statement 1 = intro, statement 2 = Kether, …, statement 11 = Malkuth).
  return statements.map((s, i) => {
    const sephIdx = i - 1
    const slug = sephIdx >= 0 ? SEPHIROTH_DESCENT_SLUGS[sephIdx] : null
    const sephirah = slug ? sephirahBySlug[slug] : null
    const bgHex = sephirah
      ? (getColor(sephirah.color, theme) ?? null)
      : null
    const fg = textColorFor(sephirah?.color)
    return {
      text: s.text,
      filledThrough: sephIdx,
      bgColor: bgHex,
      textColor: fg,
    }
  })
}

export default function TrestleboardPlayPage() {
  const router = useRouter()
  const { colorTheme: theme } = useColorTheme()
  const slides = useMemo(() => buildSlides(theme), [theme])
  const { idx, handleIdxChange } = usePlayerIndex({
    slidesLength: slides.length,
  })

  return (
    <SlidePlayer
      title="The Pattern on the Trestleboard"
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push('/texts/pattern-trestleboard')}
      renderLeft={(slide) => (
        <div className="aspect-[400/680] max-h-[33svh] max-w-full md:h-auto md:max-h-[60vh] md:w-full md:max-w-xs">
          <ProgressiveTree
            filledThrough={slide.filledThrough}
            strokeColor={slide.textColor}
          />
        </div>
      )}
      renderRight={(slide) => (
        <p
          className="text-xl leading-relaxed md:text-2xl"
          style={slide.textColor ? { color: slide.textColor } : undefined}
        >
          {slide.text}
        </p>
      )}
    />
  )
}
