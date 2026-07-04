import { notFound } from 'next/navigation'

import {
  AstrologyFocusPlayer,
  type FocusItem,
} from '@/components/AstrologyFocusPlayer'
import { planetBySlug, astrologyPlanets as planets } from '@/content/data'

export function generateStaticParams() {
  return planets.map((p) => ({ slug: p.slug }))
}

const items: ReadonlyArray<FocusItem> = planets.map((p) => ({
  slug: p.slug,
  name: p.name,
  glyph: p.glyph,
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
