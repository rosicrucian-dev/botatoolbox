import { notFound } from 'next/navigation'

import {
  AstrologyFocusPlayer,
  type FocusItem,
} from '@/components/AstrologyFocusPlayer'
import { getAstrology } from '@/content/data'
import { t } from '@/content/messages'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { astrologyPlanets } = getAstrology(DEFAULT_LOCALE)

export function generateStaticParams() {
  return astrologyPlanets.map((p) => ({ slug: p.slug }))
}

export default async function PlanetFocusPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const { astrologyPlanets, planetBySlug } = getAstrology(locale)
  const items: ReadonlyArray<FocusItem> = astrologyPlanets.map((p) => ({
    slug: p.slug,
    name: p.name,
    glyph: p.glyph,
    cardSlug: p.cardSlug,
    cardNum: p.cardNum,
    cardName: p.cardName,
    note: p.note,
    color: p.color,
  }))
  if (!planetBySlug[slug]) notFound()
  return (
    <AstrologyFocusPlayer
      items={items}
      initialSlug={slug}
      title={t(locale, 'player.astrology.planetsTitle')}
      kind="planets"
    />
  )
}
