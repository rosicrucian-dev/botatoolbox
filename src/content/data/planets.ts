// Planets — raw records from planets.json, in chakra-meditation order
// (root → crown) because the healing-pages player iterates the array
// directly. For the tarot-joined, astrology-ordered view used by the
// astrology pages, see ./astrology.ts (astrologyPlanets). German display
// fields come from `de/planets.json` (see overlay-config.ts) via
// getPlanets(locale); the top-level exports stay pinned to English.

import { z } from 'zod'

import planetsData from '@content/data/planets.json'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { PlanetSchema } from './schemas'

export type HealingPlanet = z.infer<typeof PlanetSchema>

const rawFor = localizedRaw('planets', planetsData)

export const getPlanets = defineLocalized((locale) => {
  const planets: ReadonlyArray<HealingPlanet> = z
    .array(PlanetSchema)
    .parse(rawFor(locale))

  return { planets }
})
