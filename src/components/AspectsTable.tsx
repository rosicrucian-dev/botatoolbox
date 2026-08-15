'use client'

// Tabular view of the chart's aspects, one row per aspect: the pair joined by
// the aspect's symbol (e.g. "Mars △ Jupiter") and the aspect's angle. Lists
// every detected aspect, conjunctions included (which the wheel draws no line
// for). Pure presentation over the same `Aspect[]` the wheel consumes.

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import type { Planet } from '@/content/data'
import type { Aspect, AspectType } from '@/lib/astro/aspects'
import { formatDegreesMinutes } from '@/lib/astro/layout'

// ︎ forces text presentation — same trick as the wheel's glyphs: some
// platforms otherwise render ☌/☍ as color emoji with a shifted baseline.
const ASPECT_GLYPH: Record<AspectType, string> = {
  conjunction: '☌︎',
  sextile: '⚹︎',
  square: '□︎',
  trine: '△︎',
  opposition: '☍︎',
}

// planetBySlug comes from the server parent's getAstrology(locale) so
// the datasets stay out of the client bundle.
export function AspectsTable({
  aspects,
  planetBySlug,
}: {
  aspects: Aspect[]
  planetBySlug: Record<string, Planet>
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Aspects
      </h2>
      {aspects.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No aspects within orb at this moment.
        </p>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-1/3">Planets</TableHeader>
                <TableHeader className="w-1/3">Aspect</TableHeader>
                <TableHeader className="w-1/3 text-right">Orb</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {aspects.map((asp) => (
                <TableRow key={`${asp.a}-${asp.b}`}>
                  <TableCell className="font-medium">
                    {planetBySlug[asp.a].name}{' '}
                    <span className="grayscale">{ASPECT_GLYPH[asp.type]}</span>{' '}
                    {planetBySlug[asp.b].name}
                  </TableCell>
                  <TableCell className="capitalize">{asp.type}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDegreesMinutes(asp.orb)}{' '}
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {asp.applying ? 'A' : 'S'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            A — applying (moving toward exact)
            <br />S — separating
          </p>
        </>
      )}
    </section>
  )
}
