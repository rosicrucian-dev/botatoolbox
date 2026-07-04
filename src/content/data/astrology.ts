// Astrology — joins each sign and planet with its corresponding tarot
// trump (BOTA attribution). Base data lives in content/signs.json and
// content/planets.json; this module just adds the derived tarot fields
// (cardSlug, cardName, alchemy, color) and exposes lookup maps.

import { byKey } from './helpers'
import { planets as basePlanets, type HealingPlanet } from './planets'
import { signs as baseSigns, type HealingSign } from './signs'
import { cardByAstrology } from './tarot'

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

function joinTarot(name: string): CardJoin {
  const card = cardByAstrology[name.toLowerCase()]
  if (!card) throw new Error(`No tarot card for ${name}`)
  return {
    cardSlug: card.slug,
    cardName: card.name,
    cardNum: card.num,
    alchemy: card.alchemy,
    color: card.color,
    note: card.note,
  }
}

export type Sign = HealingSign & CardJoin
export type Planet = HealingPlanet & CardJoin

// Named astrologySigns/astrologyPlanets (not signs/planets) because the
// raw records keep those names — this is the joined, re-ordered view.
export const astrologySigns: ReadonlyArray<Sign> = baseSigns.map((s) => ({
  ...s,
  ...joinTarot(s.name),
}))

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

export const astrologyPlanets: ReadonlyArray<Planet> = [...basePlanets]
  .map((p) => ({ ...p, ...joinTarot(p.name) }))
  .sort(
    (a, b) =>
      ASTROLOGY_PLANET_ORDER.indexOf(a.slug as never) -
      ASTROLOGY_PLANET_ORDER.indexOf(b.slug as never),
  )

export const signBySlug = byKey(astrologySigns, 'slug', 'sign.slug')
export const planetBySlug = byKey(astrologyPlanets, 'slug', 'planet.slug')
