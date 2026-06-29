import Link from 'next/link'
import { type Metadata } from 'next'

import { chakras } from '@/content/data'
import { planetBySlug } from '@/content/data/astrology'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'

export const metadata: Metadata = {
  title: 'Chakras',
}

export default function ChakrasPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Chakras
      </h1>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader>Planet</TableHeader>
            <TableHeader>Metal</TableHeader>
            <TableHeader>Chakra</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {chakras.map((c) => {
            const planet = planetBySlug[c.planet]
            return (
              <TableRow key={c.planet}>
                <TableCell>
                  {planet ? (
                    <Link
                      href={`/astrology/planets/${planet.slug}`}
                      className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                    >
                      {planet.name}
                    </Link>
                  ) : (
                    c.planet
                  )}
                </TableCell>
                <TableCell>{c.metal}</TableCell>
                <TableCell>{c.chakra}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </article>
  )
}
