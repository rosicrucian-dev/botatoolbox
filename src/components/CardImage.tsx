'use client'

import { cardImage, thumbImage, type TarotCard } from '@/content/data/tarot'
import { minorImage, type MinorEntry } from '@/content/data'
import { useTarotStyle } from '@/lib/tarotStyle'

type ImgProps = Omit<React.ComponentPropsWithoutRef<'img'>, 'src'>

// A major-arcana card image in the user's chosen Major style. Reads the style
// from the persisted store so the right art renders even when dropped inside a
// server-rendered page (the <img> itself is a client component). Pass `thumb`
// for the half-size tableau/tree variant. Any <img> attribute (alt, width,
// className, loading, …) is forwarded.
export function MajorImage({
  card,
  thumb = false,
  ...img
}: {
  card: Pick<TarotCard, 'num' | 'slug'>
  thumb?: boolean
} & ImgProps) {
  const { majorStyle } = useTarotStyle()
  const src = thumb ? thumbImage(card, majorStyle) : cardImage(card, majorStyle)
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} {...img} />
}

// A minor-arcana card image in the user's chosen Minor style.
export function MinorImage({
  card,
  ...img
}: {
  card: Pick<MinorEntry, 'slug'>
} & ImgProps) {
  const { minorStyle } = useTarotStyle()
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={minorImage(card, minorStyle)} {...img} />
}
