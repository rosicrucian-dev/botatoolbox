'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { cardImage } from '@/content/data/tarot'
import { ensureAudioContext } from '@/lib/audioContext'
import { getColor, textColorFor, type ThemeId } from '@/lib/colors'
import { useColorTheme } from '@/lib/colorTheme'
import { useToneOnIdx } from '@/lib/useToneOnIdx'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'

// The minimal shape Focus needs from a sign or planet. Both already
// have these fields after the tarot join in `astrology.ts`.
export interface FocusItem {
  slug: string
  name: string
  symbol: string
  cardSlug: string
  cardNum: number
  cardName: string
  note: string
  color: string
}

// Renders the Focus meditation: tarot card on the left, a single big
// astrological glyph on the right. Manual advance only (no auto-tick).
// Next/Prev cycles through the full list (all 12 signs or all 10 planets)
// and keeps the URL in sync so closing the player returns to the *current*
// item's detail page even after the user has navigated within Focus.
export function AstrologyFocusPlayer({
  items,
  initialSlug,
  title,
  kind,
}: {
  items: ReadonlyArray<FocusItem>
  initialSlug: string
  title: string
  kind: 'signs' | 'planets'
}) {
  // Detail URL for any slug, e.g. `/astrology/signs/aries`. The Focus
  // URL is the same shape with `/focus` appended; both the close button
  // and the in-player Next/Prev URL sync use this.
  const detailHrefForSlug = (s: string) => `/astrology/${kind}/${s}`

  const router = useRouter()
  const { colorTheme: theme } = useColorTheme()

  const slides = useMemo(
    () => items.map((i) => buildSlide(i, theme)),
    [items, theme],
  )

  const initialIdx = Math.max(
    0,
    items.findIndex((i) => i.slug === initialSlug),
  )
  const [idx, setIdx] = useState(initialIdx)
  const current = slides[idx]

  const handleIdxChange = useCallback(
    (next: number) => {
      ensureAudioContext()
      setIdx(next)
      const newSlug = items[next]?.slug
      if (newSlug && newSlug !== initialSlug) {
        // Mirror the in-player navigation back to the URL via replace
        // (no history stack pollution). On refresh or close, the URL
        // points at the current item.
        router.replace(`${detailHrefForSlug(newSlug)}/focus`, {
          scroll: false,
        })
      }
    },
    [items, initialSlug, router, detailHrefForSlug],
  )

  const { playCurrent } = useToneOnIdx({
    note: current?.note,
    idx,
    autoplay: false,
  })

  const closeHref = detailHrefForSlug(items[idx]?.slug ?? initialSlug)

  return (
    <SlidePlayer
      title={title}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push(closeHref)}
      extraHeaderItem={
        current?.note ? <SoundButton onClick={playCurrent} /> : null
      }
      renderLeft={(slide) => (
        <img
          src={cardImage({ num: slide.cardNum, slug: slide.cardSlug })}
          alt={slide.cardName}
          className="max-h-[33svh] max-w-full rounded-lg object-contain shadow-2xl md:max-h-[50vh] md:max-w-[280px]"
        />
      )}
      renderRight={(slide) => (
        // Astrology glyphs render as full-color emoji on Apple platforms
        // (the rounded purple square in your screenshot is the system
        // emoji asset). Sized down to ~half the Hebrew-glyph size since
        // emoji are bitmaps that get blurry when scaled past their
        // intrinsic resolution. `leading-tight` (vs leading-none) keeps
        // the emoji's bounding box from clipping at the top/bottom of
        // the line — emoji glyphs need a bit more vertical breathing
        // room than text glyphs.
        // `grayscale` desaturates Apple's colored emoji asset (the
        // purple rounded square) without touching its shape or the
        // surrounding layout — no overlay or clip-path needed, so the
        // rounded corners stay intact. Monochrome-emoji platforms
        // (Linux/Windows) are unaffected since they're already
        // grayscale.
        <div
          className="text-center text-[min(15vh,35vw)] leading-tight grayscale md:text-[min(22vh,40vw)]"
          aria-label={slide.label ?? undefined}
        >
          {slide.symbol}
        </div>
      )}
    />
  )
}

function buildSlide(item: FocusItem, theme: ThemeId) {
  return {
    ...item,
    label: item.name,
    bgColor: getColor(item.color, theme),
    textColor: textColorFor(item.color),
  }
}
