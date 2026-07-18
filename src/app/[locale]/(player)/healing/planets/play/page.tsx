import { getPlanets, getTarot } from '@/content/data'
import { getLetterMeta } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import { PlanetsPlayClient, type PlanetSlideData } from './PlanetsPlayClient'

// Server shell: joins each classical planet with its tarot card at build
// time and hands the slide data to the client player.
export default async function PlanetsPlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  const { planets } = getPlanets(locale)
  const { cardByLetter } = getTarot(locale)
  const slides: Array<PlanetSlideData> = planets
    .filter((p) => p.chakra)
    .map((p) => {
      const card = cardByLetter[p.letter]
      return {
        label: p.name,
        chakra: p.chakra,
        glyph: getLetterMeta(p.letter).glyph,
        note: card?.note,
        color: card?.color,
        cardNum: card?.num,
        cardSlug: card?.slug,
        cardName: card?.name,
        isSetup: false as const,
      }
    })
  return <PlanetsPlayClient planets={slides} />
}
