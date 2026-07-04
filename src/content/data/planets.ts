// Planets — raw records from planets.json, in chakra-meditation order
// (root → crown) because the healing-pages player iterates the array
// directly. For the tarot-joined, astrology-ordered view used by the
// astrology pages, see ./astrology.ts (astrologyPlanets).

import { z } from 'zod'

import planetsData from '@content/data/planets.json'
import { PlanetSchema } from './schemas'

export type HealingPlanet = z.infer<typeof PlanetSchema>

export const planets: ReadonlyArray<HealingPlanet> = z
  .array(PlanetSchema)
  .parse(planetsData)
