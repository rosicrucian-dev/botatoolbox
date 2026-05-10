import { notFound } from 'next/navigation'

import { signs, signBySlug } from '@/content/data/astrology'
import {
  AstrologyFocusPlayer,
  type FocusItem,
} from '@/components/AstrologyFocusPlayer'

export function generateStaticParams() {
  return signs.map((s) => ({ slug: s.slug }))
}

const items: ReadonlyArray<FocusItem> = signs.map((s) => ({
  slug: s.slug,
  name: s.name,
  symbol: s.symbol,
  cardSlug: s.cardSlug,
  cardNum: s.cardNum,
  cardName: s.cardName,
  note: s.note,
  color: s.color,
}))

export default async function SignFocusPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!signBySlug[slug]) notFound()
  return (
    <AstrologyFocusPlayer
      items={items}
      initialSlug={slug}
      title="Signs"
      kind="signs"
    />
  )
}
