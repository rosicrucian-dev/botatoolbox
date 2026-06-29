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
import { planetBySlug, signBySlug } from '@/content/data/astrology'
import type { Chart } from '@/lib/astro/types'

/** Format a 0–30 within-sign longitude as e.g. `7°46′`. */
function formatPosition(degreeInSign: number): string {
  let deg = Math.floor(degreeInSign)
  let min = Math.round((degreeInSign - deg) * 60)
  if (min === 60) {
    min = 0
    deg += 1
  }
  return `${deg}°${min.toString().padStart(2, '0')}′`
}

export function AstrologyTable({ chart }: { chart: Chart | null }) {
  if (!chart) return null
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
              </TableCell>
              <TableCell>{signBySlug[body.sign].name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPosition(body.degreeInSign)}
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
