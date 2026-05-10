import { notFound } from 'next/navigation'

import { planets, planetBySlug } from '@/content/data/astrology'
import {
  AstrologyFocusPlayer,
  type FocusItem,
} from '@/components/AstrologyFocusPlayer'

export function generateStaticParams() {
  return planets.map((p) => ({ slug: p.slug }))
}

const items: ReadonlyArray<FocusItem> = planets.map((p) => ({
  slug: p.slug,
  name: p.name,
  symbol: p.symbol,
  cardSlug: p.cardSlug,
  cardNum: p.cardNum,
  cardName: p.cardName,
  note: p.note,
  color: p.color,
}))

export default async function PlanetFocusPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!planetBySlug[slug]) notFound()
  return (
    <AstrologyFocusPlayer
      items={items}
      initialSlug={slug}
      title="Planets"
      kind="planets"
    />
  )
}
