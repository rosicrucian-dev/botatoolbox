'use client'

import type { MinorEntry, TarotCard } from '@/content/data'
import { cardImage, minorImage, thumbImage } from '@/content/data/tarot-images'
import { minorAspectRatio } from '@/content/data/tarot-styles'
import { useTarotStyle } from '@/lib/stores/tarotStyle'

type ImgProps = Omit<React.ComponentPropsWithoutRef<'img'>, 'src'> & {
  alt: string
}

// A major-arcana card image in the user's chosen Major style. Reads the style
// from the persisted store so the right art renders even when dropped inside a
// server-rendered page (the <img> itself is a client component). Pass `thumb`
// for the half-size tableau/tree variant. Any <img> attribute (alt, width,
// className, loading, …) is forwarded.
export function MajorImage({
  card,
  thumb = false,
  alt,
  ...img
}: {
  card: Pick<TarotCard, 'num' | 'slug'>
  thumb?: boolean
} & ImgProps) {
  const { majorStyle } = useTarotStyle()
  const src = thumb ? thumbImage(card, majorStyle) : cardImage(card, majorStyle)
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...img} />
}

// A minor-arcana card image in the user's chosen Minor style. Unless the
// caller passes them, its intrinsic width/height are the style's own aspect
// ratio, so a `w-full` image reserves the right height before the bytes load
// whichever style is chosen (the styles' cards are not all one shape).
export function MinorImage({
  card,
  alt,
  ...img
}: {
  card: Pick<MinorEntry, 'slug'>
} & ImgProps) {
  const { minorStyle } = useTarotStyle()
  const width = img.width ?? 1000
  const height = img.height ?? Math.round(1000 / minorAspectRatio(minorStyle))
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={minorImage(card, minorStyle)}
      alt={alt}
      {...img}
      width={width}
      height={height}
    />
  )
}
