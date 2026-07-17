// Astrology — joins each sign and planet with its corresponding tarot
// trump (BOTA attribution). Base data lives in content/signs.json and
// content/planets.json; this module just adds the derived tarot fields
// (cardSlug, cardName, alchemy, color) and exposes lookup maps.
// Localized via getAstrology(locale), which joins the same-locale sign/
// planet/tarot views (the join key — English sign/planet `name` vs
// tarot `astrology` — is never translated); top-level exports stay
// pinned to English.

import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { getPlanets, type HealingPlanet } from './planets'
import { getSigns, type HealingSign } from './signs'
import { getTarot, type TarotCard } from './tarot'

interface CardJoin {
  cardSlug: string
  cardName: string
  cardNum: number
  alchemy: string
  color: string
  // The musical note attributed to this sign/planet — inherited from
  // its tarot card. Drives meditation-player tone playback.
  note: string
}

export type Sign = HealingSign & CardJoin
export type Planet = HealingPlanet & CardJoin

// Traditional educational order for the astrology views: luminaries
// first (Sun, Moon — most important in any chart), then the rest by
// distance from the Sun. Modern triple appended at the end. This is the
// order BOTA literature and most learning materials present them in.
//
// `planets.json` itself stays in chakra-meditation order (root → crown)
// because the healing-pages player iterates it directly. The astrology
// pages and planet detail page prev/next consume the sorted view below.
//
// BODY_SLUGS in src/lib/astro/types.ts deliberately duplicates this order
// (that module stays app-import-free so it can lift out). Keep in sync.
const ASTROLOGY_PLANET_ORDER = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const

export const getAstrology = defineLocalized((locale) => {
  const { cardByAstrology } = getTarot(locale)

  // Joined by SLUG, not display name: for every sign/planet the slug
  // equals the lowercased English name — which is exactly how
  // cardByAstrology is keyed — and unlike the name it never translates.
  function joinTarot(slug: string): CardJoin {
    const card: TarotCard | undefined = cardByAstrology[slug]
    if (!card) throw new Error(`No tarot card for ${slug}`)
    return {
      cardSlug: card.slug,
      cardName: card.name,
      cardNum: card.num,
      alchemy: card.alchemy,
      color: card.color,
      note: card.note,
    }
  }

  // Named astrologySigns/astrologyPlanets (not signs/planets) because the
  // raw records keep those names — this is the joined, re-ordered view.
  const astrologySigns: ReadonlyArray<Sign> = getSigns(locale).signs.map(
    (s) => ({
      ...s,
      ...joinTarot(s.slug),
    }),
  )

  const astrologyPlanets: ReadonlyArray<Planet> = [
    ...getPlanets(locale).planets,
  ]
    .map((p) => ({ ...p, ...joinTarot(p.slug) }))
    .sort(
      (a, b) =>
        ASTROLOGY_PLANET_ORDER.indexOf(a.slug as never) -
        ASTROLOGY_PLANET_ORDER.indexOf(b.slug as never),
    )

  const signBySlug = byKey(astrologySigns, 'slug', 'sign.slug')
  const planetBySlug = byKey(astrologyPlanets, 'slug', 'planet.slug')

  return { astrologySigns, astrologyPlanets, signBySlug, planetBySlug }
})
