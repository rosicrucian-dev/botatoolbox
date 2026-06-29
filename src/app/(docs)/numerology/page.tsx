import { type Metadata } from 'next'

import { numerology } from '@/content/data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'

export const metadata: Metadata = {
  title: 'Numerology',
}

export default function NumerologyPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Numerology
      </h1>

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
              <TableCell className="w-20 font-medium tabular-nums text-zinc-900 dark:text-white">
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
