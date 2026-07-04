// Golden Dawn grade ladder — Neophyte (0=0) is the outer-order
// initiation; the remaining ten grades each sit on one sephirah of the
// Tree of Life. Edit `grades.json` to add or rename a grade; this
// module is the typed view + lookup maps.

import { z } from 'zod'

import data from '@content/data/grades.json'

import { byKey } from './helpers'
import { GradeSchema } from './schemas'

export type Grade = z.infer<typeof GradeSchema>

export const grades: ReadonlyArray<Grade> = z.array(GradeSchema).parse(data)

export const gradeBySlug = byKey(grades, 'slug', 'grade.slug')

// Reverse-lookup: find the grade for a given sephirah slug. Neophyte
// has no sephirah, so it's filtered out before mapping.
export const gradeBySephirahSlug = byKey(
  grades.filter((g): g is Grade & { sephirah: string } => g.sephirah !== null),
  'sephirah',
  'grade.sephirah',
)
