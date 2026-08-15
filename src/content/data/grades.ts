// Golden Dawn grade ladder — Neophyte (0=0) is the outer-order
// initiation; the remaining ten grades each sit on one sephirah of the
// Tree of Life. Edit `grades.json` to add or rename a grade; this
// module is the typed view + lookup maps. German display fields come
// from `de/grades.json` (see overlay-config.ts) via getGrades(locale);
// the top-level exports stay pinned to English.

import { z } from 'zod'

import data from '@content/data/en/grades.json'

import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { GradeSchema } from './schemas'

export type Grade = z.infer<typeof GradeSchema>

const rawFor = localizedRaw('grades', data)

export const getGrades = defineLocalized((locale) => {
  const grades: ReadonlyArray<Grade> = z
    .array(GradeSchema)
    .parse(rawFor(locale))

  const gradeBySlug = byKey(grades, 'slug', 'grade.slug')

  // Reverse-lookup: find the grade for a given sephirah slug. Neophyte
  // has no sephirah, so it's filtered out before mapping.
  const gradeBySephirahSlug = byKey(
    grades.filter(
      (g): g is Grade & { sephirah: string } => g.sephirah !== null,
    ),
    'sephirah',
    'grade.sephirah',
  )

  return { grades, gradeBySlug, gradeBySephirahSlug }
})
