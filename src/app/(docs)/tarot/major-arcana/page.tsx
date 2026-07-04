import { type Metadata } from 'next'

import { DataList } from '@/components/DataList'
import { IndexLabel } from '@/components/IndexLabel'
import { PageHeading } from '@/components/PageHeading'
import { cards } from '@/content/data'

export const metadata: Metadata = {
  title: 'Major Arcana',
}

export default function MajorArcana() {
  return (
    <article className="space-y-6">
      <PageHeading>Major Arcana</PageHeading>
      <DataList
        items={cards}
        getKey={(c) => c.slug}
        getHref={(c) => `/tarot/${c.slug}`}
        renderRow={(c) => (
          <>
            <span className="flex items-baseline gap-3">
              {/* Match the Minor Arcana page's wider first column for
                  consistency across the two list pages. */}
              <IndexLabel widthClassName="w-16 md:w-20">{c.num}</IndexLabel>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {c.name}
              </span>
            </span>
            <span className="text-zinc-400" aria-hidden>
              →
            </span>
          </>
        )}
      />
    </article>
  )
}
