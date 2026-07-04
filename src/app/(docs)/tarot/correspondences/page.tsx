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
import { cards, type TarotCard } from '@/content/data'

export const metadata: Metadata = {
  title: 'Correspondences',
}

// Column definition: how to label it in the header and how to pull the
// value from a card. Headers are kept short to save horizontal space.
// First abbreviation per user direction: "Letter Significance" → "Significance".
const COLUMNS: Array<{
  label: string
  value: (c: TarotCard) => string | number
}> = [
  { label: 'Color', value: (c) => c.color },
  { label: 'Note', value: (c) => c.note },
  { label: 'Letter', value: (c) => c.letter },
  { label: 'English', value: (c) => c.english },
  {
    label: 'Significance',
    // "Front of Head (Face)" is shortened to just "Front of Head" in
    // this table only; the underlying value used by the detail page
    // and quiz is unchanged.
    value: (c) =>
      c.significance === 'Front of Head (Face)'
        ? 'Front of Head'
        : c.significance,
  },
  { label: 'Gematria', value: (c) => c.gematria },
  { label: 'Path', value: (c) => c.path },
  { label: 'Astrology', value: (c) => c.astrology },
  { label: 'Alchemy', value: (c) => c.alchemy },
  // "Intelligence" inside every value collapses to "I" to save column
  // width. Header still reads "Intelligence" for clarity.
  {
    label: 'Intelligence',
    value: (c) => c.intelligence.replace(/Intelligence/g, 'I'),
  },
  { label: 'Power', value: (c) => c.power },
  { label: 'Human / Opposite', value: (c) => c.human },
]

// Pins the Key column to the left edge so the card name stays visible while
// scrolling through attributes — same trick spreadsheets use. text-xs keeps
// the 13-column table dense (overrides Catalyst's default text-sm).
const STICKY = 'sticky left-0 z-10 bg-white text-xs dark:bg-zinc-900'

export default function CorrespondencesPage() {
  return (
    <article className="space-y-6">
      <PageHeading>Correspondences</PageHeading>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className={STICKY}>Key</TableHeader>
            {COLUMNS.map((col) => (
              <TableHeader key={col.label} className="text-xs">
                {col.label}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.slug}>
              <TableCell className={`${STICKY} align-top`}>
                <TextLink href={`/tarot/${card.slug}`} className="font-medium">
                  {card.name}
                </TextLink>
              </TableCell>
              {COLUMNS.map((col) => (
                <TableCell key={col.label} className="align-top text-xs">
                  {col.value(card)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
