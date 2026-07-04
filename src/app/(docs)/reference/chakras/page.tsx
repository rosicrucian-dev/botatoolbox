import { type Metadata } from 'next'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import { PageHeading } from '@/components/PageHeading'
import { TextLink } from '@/components/TextLink'
import { chakras, planetBySlug } from '@/content/data'

export const metadata: Metadata = {
  title: 'Chakras',
}

export default function ChakrasPage() {
  return (
    <article className="space-y-6">
      <PageHeading>Chakras</PageHeading>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader>Planet</TableHeader>
            <TableHeader>Metal</TableHeader>
            <TableHeader>Chakra</TableHeader>
            <TableHeader>Church</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Displayed crown → root (Mercury at top, Saturn at bottom).
              The `chakras` data stays in its documented root → crown order,
              so reverse a copy here rather than mutating the source. */}
          {[...chakras].reverse().map((c) => {
            const planet = planetBySlug[c.planet]
            return (
              <TableRow key={c.planet}>
                <TableCell>
                  {planet ? (
                    <TextLink
                      href={`/reference/astrology/planets/${planet.slug}`}
                      className="font-medium"
                    >
                      {planet.name}
                    </TextLink>
                  ) : (
                    c.planet
                  )}
                </TableCell>
                <TableCell>{c.metal}</TableCell>
                <TableCell>{c.chakra}</TableCell>
                <TableCell>{c.church}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </article>
  )
}
