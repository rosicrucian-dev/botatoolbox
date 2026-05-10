// Astrology — joins each sign and planet with its corresponding tarot
// trump (BOTA attribution). Base data lives in content/signs.json and
// content/planets.json; this module just adds the derived tarot fields
// (cardSlug, cardName, alchemy, color) and exposes lookup maps.

import { signs as baseSigns, planets as basePlanets } from '.'
import type { HealingSign, HealingPlanet } from '.'
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

export const signs: ReadonlyArray<Sign> = baseSigns.map((s) => ({
  ...s,
  ...joinTarot(s.name),
}))

export const planets: ReadonlyArray<Planet> = basePlanets.map((p) => ({
  ...p,
  ...joinTarot(p.name),
}))

export const signBySlug = Object.fromEntries(
  signs.map((s) => [s.slug, s]),
) as Record<string, Sign>

export const planetBySlug = Object.fromEntries(
  planets.map((p) => [p.slug, p]),
) as Record<string, Planet>
