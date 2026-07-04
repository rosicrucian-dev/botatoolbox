// Sephiroth — the ten emanations on the Tree of Life.

import { z } from 'zod'

import sephirothData from '@content/data/sephiroth.json'
import { byKey } from './helpers'
import { SephirahSchema } from './schemas'

export type Sephirah = z.infer<typeof SephirahSchema>

export const sephiroth: ReadonlyArray<Sephirah> = z
  .array(SephirahSchema)
  .parse(sephirothData)

export const sephirahBySlug = byKey(sephiroth, 'slug', 'sephirah.slug')

// Sephiroth in tree-descent order (Kether → Malkuth). The JSON array
// itself follows the source-PDF order (Malkuth-first), so consumers
// that need descent semantics — the Pattern on the Trestleboard player,
// ProgressiveTree's `filledThrough` index — use this list instead of
// relying on array position.
export const SEPHIROTH_DESCENT_SLUGS = [
  'kether',
  'chokmah',
  'binah',
  'chesed',
  'geburah',
  'tiphareth',
  'netzach',
  'hod',
  'yesod',
  'malkuth',
] as const
