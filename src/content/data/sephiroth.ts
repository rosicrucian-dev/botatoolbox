// Sephiroth — the ten emanations on the Tree of Life. German display
// fields come from `de/sephiroth.json` (see overlay-config.ts) via
// getSephiroth(locale); the top-level exports stay pinned to English.

import { z } from 'zod'

import sephirothData from '@content/data/sephiroth.json'
import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { SephirahSchema } from './schemas'

export type Sephirah = z.infer<typeof SephirahSchema>

const rawFor = localizedRaw('sephiroth', sephirothData)

export const getSephiroth = defineLocalized((locale) => {
  const sephiroth: ReadonlyArray<Sephirah> = z
    .array(SephirahSchema)
    .parse(rawFor(locale))

  const sephirahBySlug = byKey(sephiroth, 'slug', 'sephirah.slug')

  return { sephiroth, sephirahBySlug }
})

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
