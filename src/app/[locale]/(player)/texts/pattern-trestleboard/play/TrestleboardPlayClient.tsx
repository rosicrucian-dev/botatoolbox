'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useT } from '@/content/messages/useT'
import { useMemo } from 'react'

import { ProgressiveTree } from '@/components/ProgressiveTree'
import { SlidePlayer } from '@/components/SlidePlayer'
import { useColorPalette } from '@/lib/colorPalette'
import { getColor, textColorFor } from '@/lib/colors'
import type { ProgressiveTreeData } from '@/lib/tree-layout'
import { usePlayerIndex } from '@/lib/usePlayerIndex'

// One statement's static slide data, prepared by the server page
// (statement ↔ sephirah pairing done there so the datasets stay out of
// the bundle). `color` is the sephirah's palette key; the hex lookup
// stays client-side because the palette is a client store.
export interface TrestleboardSlide {
  text: string
  filledThrough: number
  color?: string
}

export function TrestleboardPlayClient({
  statements,
  tree,
}: {
  statements: ReadonlyArray<TrestleboardSlide>
  tree: ProgressiveTreeData
}) {
  const { t } = useT()
  const router = useLocaleRouter()
  const { colorPalette: theme } = useColorPalette()
  const slides = useMemo(
    () =>
      statements.map((s) => ({
        ...s,
        bgColor: s.color ? (getColor(s.color, theme) ?? null) : null,
        textColor: textColorFor(s.color),
      })),
    [statements, theme],
  )
  const { idx, handleIdxChange } = usePlayerIndex({
    slidesLength: slides.length,
  })

  return (
    <SlidePlayer
      title={t('player.trestleboard.title')}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push('/texts/pattern-trestleboard')}
      renderLeft={(slide) => (
        <div className="aspect-[400/680] max-h-[33svh] max-w-full md:h-auto md:max-h-[60vh] md:w-full md:max-w-xs">
          <ProgressiveTree
            tree={tree}
            filledThrough={slide.filledThrough}
            strokeColor={slide.textColor}
            palette={theme}
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
