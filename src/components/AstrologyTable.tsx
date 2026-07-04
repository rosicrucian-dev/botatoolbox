// Tabular view of the chart, one row per body: name, sign, and position
// within the sign (degrees and arcminutes). Pure presentation over the same
// `Chart` the wheel consumes; rows appear once the client has computed it.

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import { planetBySlug, signBySlug } from '@/content/data'
import { formatDegreesMinutes } from '@/lib/astro/layout'
import { lunarQuarter, type Chart } from '@/lib/astro/types'

export function AstrologyTable({ chart }: { chart: Chart | null }) {
  if (!chart) return null
  // Shown on the Moon's row: which quarter of the lunation it's in.
  const quarter = lunarQuarter(chart)
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Planets
      </h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader className="w-1/3">Planet</TableHeader>
            <TableHeader className="w-1/3">Sign</TableHeader>
            <TableHeader className="w-1/3 text-right">Position</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {chart.bodies.map((body) => (
            <TableRow key={body.slug}>
              <TableCell className="font-medium">
                {planetBySlug[body.slug].name}
                {body.slug === 'moon' && quarter !== null && (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {' '}
                    (Q{quarter})
                  </span>
                )}
              </TableCell>
              <TableCell>{signBySlug[body.sign].name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatDegreesMinutes(body.degreeInSign)}
                {body.retrograde && (
                  <span className="text-zinc-500 dark:text-zinc-400"> ℞</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
