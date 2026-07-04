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
import { numerology } from '@/content/data'

export const metadata: Metadata = {
  title: 'Numerology',
}

export default function NumerologyPage() {
  return (
    <article className="space-y-6">
      <PageHeading>Numerology</PageHeading>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className="w-20">Number</TableHeader>
            <TableHeader>Meaning</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {numerology.map((n) => (
            <TableRow key={n.num}>
              <TableCell className="w-20 font-medium text-zinc-900 tabular-nums dark:text-white">
                {n.num}
              </TableCell>
              <TableCell className="whitespace-normal">{n.meaning}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
