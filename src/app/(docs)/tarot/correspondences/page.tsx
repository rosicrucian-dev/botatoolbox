import Link from 'next/link'
import { type Metadata } from 'next'

import { cards, type TarotCard } from '@/content/data/tarot'

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
  { label: 'Intelligence', value: (c) => c.intelligence.replace(/Intelligence/g, 'I') },
  { label: 'Power', value: (c) => c.power },
  { label: 'Human / Opposite', value: (c) => c.human },
]

export default function CorrespondencesPage() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Correspondences
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Scroll horizontally to see all available data.
        </p>
      </header>

      {/* Table is wider than the article column. Wrapping in
          overflow-x-auto lets it scroll horizontally on its own without
          forcing horizontal scroll on the whole page. */}
      <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full px-4 sm:px-6 lg:px-8">
          <table className="min-w-full border-separate border-spacing-0 text-xs">
            <thead>
              <tr>
                <Th sticky>Key</Th>
                {COLUMNS.map((col) => (
                  <Th key={col.label}>{col.label}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.slug}>
                  <Td sticky>
                    <Link
                      href={`/tarot/${card.slug}`}
                      className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                    >
                      {card.name}
                    </Link>
                  </Td>
                  {COLUMNS.map((col) => (
                    <Td key={col.label}>{col.value(card)}</Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  )
}

// Shared cell styling. `sticky` pins the Key column to the left edge so
// the card name stays visible while horizontally scrolling through
// attributes — same trick spreadsheets use.
const CELL =
  'border-b border-zinc-200 px-2 py-2 align-top whitespace-nowrap dark:border-zinc-800'

function Th({
  sticky = false,
  children,
}: {
  sticky?: boolean
  children: React.ReactNode
}) {
  return (
    <th
      scope="col"
      className={`${CELL} text-left font-semibold text-zinc-700 dark:text-zinc-300 ${
        sticky ? 'sticky left-0 z-10 bg-white dark:bg-zinc-900' : ''
      }`}
    >
      {children}
    </th>
  )
}

function Td({
  sticky = false,
  children,
}: {
  sticky?: boolean
  children: React.ReactNode
}) {
  return (
    <td
      className={`${CELL} text-zinc-900 dark:text-zinc-100 ${
        sticky ? 'sticky left-0 z-10 bg-white dark:bg-zinc-900' : ''
      }`}
    >
      {children}
    </td>
  )
}
