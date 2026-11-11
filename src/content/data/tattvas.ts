// The five tattvas as ROWS — the sense, quality, form and colour the
// lessons give each, in the order of their evolution.
//
// NOT src/lib/tattvas.ts, which is the same five as SHAPES: the
// geometry each symbol is drawn from and the palette tokens it is
// drawn in. One says what a tattva IS, the other how it is drawn, and
// the names here are kept apart for that reason (`TattvaRow`,
// `getTattvas`) — `color` in this file is the colour the lesson names
// ("Silver-white"), where `color` in that one is a palette reference.
//
// ENGLISH ONLY for now, as forces.ts is, and for the same reason.

import { z } from 'zod'

import data from '@content/data/en/tattvas.json'
import { TattvaSchema } from '@content/data/schemas'

import { defineLocalized } from './localized'

export type TattvaRow = z.infer<typeof TattvaSchema>

export const getTattvas = defineLocalized(() => {
  const tattvaRows: ReadonlyArray<TattvaRow> = z
    .array(TattvaSchema)
    .parse(data)

  return { tattvaRows }
})
