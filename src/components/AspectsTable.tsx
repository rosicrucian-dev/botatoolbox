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
import { planetBySlug } from '@/content/data/astrology'
import type { Aspect, AspectType } from '@/lib/astro/aspects'

const ASPECT_GLYPH: Record<AspectType, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
}

/** Format an orb (deviation from exact, in degrees) as e.g. `3°22′`. */
function formatOrb(orb: number): string {
  let deg = Math.floor(orb)
  let min = Math.round((orb - deg) * 60)
  if (min === 60) {
    min = 0
    deg += 1
  }
  return `${deg}°${min.toString().padStart(2, '0')}′`
}

export function AspectsTable({ aspects }: { aspects: Aspect[] }) {
  if (aspects.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Aspects
      </h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader className="w-1/3">Pair</TableHeader>
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
                {formatOrb(asp.orb)}{' '}
                <span className="text-zinc-500 dark:text-zinc-400">
                  {asp.applying ? 'A' : 'S'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
