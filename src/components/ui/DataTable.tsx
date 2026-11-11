// A CORRESPONDENCE TABLE: headings, then a row of cells.
//
// The same `head` / `rows` shape the Hermetic Order of Aquarius draws
// its Reference tables with (its `Table`, src/components/ui/page.tsx),
// so the two sites' tables are the same declaration read twice and a
// column added to one is a line to add to the other. WHAT MATCHES IS
// THE TABLE, NOT THE CHROME: this one is built from Catalyst, as every
// other table here is, and that site's is built from its own.
//
// A cell is a node, so a glyph, a link or a drawn symbol goes in as
// itself; the first column is the key and is set in the text colour.

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import clsx from 'clsx'
import type { ReactNode } from 'react'

export function DataTable({
  head,
  rows,
  nowrap = false,
}: {
  head: ReadonlyArray<ReactNode>
  rows: ReadonlyArray<ReadonlyArray<ReactNode>>
  /** Each cell on one line: a wide table scrolls instead of wrapping. */
  nowrap?: boolean
}) {
  return (
    <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
      <TableHead>
        <TableRow>
          {head.map((h, i) => (
            <TableHeader key={i}>{h}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, r) => (
          <TableRow key={r} className="align-top">
            {row.map((cell, i) => (
              <TableCell
                key={i}
                className={clsx(
                  i === 0 && 'font-medium text-zinc-900 dark:text-white',
                  nowrap ? 'whitespace-nowrap' : 'whitespace-normal',
                )}
              >
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
