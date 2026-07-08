import { type Metadata } from 'next'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DataList } from '@/components/DataList'
import { IndexLabel } from '@/components/IndexLabel'
import { PageHeading } from '@/components/PageHeading'
import { suitCorrespondences, suits } from '@/content/data'

export const metadata: Metadata = {
  title: 'Minor Arcana',
}

export default function MinorArcana() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Minor Arcana' }]} />
      <PageHeading>Minor Arcana</PageHeading>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Suits
        </h2>
        <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
          <TableHead>
            <TableRow>
              <TableHeader>Tarot</TableHeader>
              <TableHeader>Playing Card</TableHeader>
              <TableHeader>World</TableHeader>
              <TableHeader>Element</TableHeader>
              <TableHeader>Letter</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {suitCorrespondences.map((s) => (
              <TableRow key={s.tarot}>
                <TableCell className="font-medium text-zinc-900 dark:text-white">
                  {s.tarot}
                </TableCell>
                <TableCell>{s.playingCard}</TableCell>
                <TableCell>{s.world}</TableCell>
                <TableCell>{s.element}</TableCell>
                <TableCell>{s.letter}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <div className="grid grid-cols-1 gap-8">
        {suits.map((suit) => (
          <section key={suit.suit}>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {suit.suit}
            </h2>
            <DataList
              items={suit.cards}
              getKey={(card) => card.num}
              getHref={(card) =>
                `/tarot/${card.num.toLowerCase()}-${suit.suit.toLowerCase()}`
              }
              renderRow={(card) => (
                <>
                  <span className="flex items-baseline gap-3">
                    <IndexLabel widthClassName="w-16 md:w-20">
                      {card.num}
                    </IndexLabel>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {card.keyword}
                    </span>
                  </span>
                  <span className="text-zinc-400" aria-hidden>
                    →
                  </span>
                </>
              )}
            />
          </section>
        ))}
      </div>
    </article>
  )
}
