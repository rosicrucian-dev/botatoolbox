import { type Metadata } from 'next'

import { DataList } from '@/components/DataList'
import { IndexLabel } from '@/components/IndexLabel'
import { cards } from '@/content/data/tarot'

export const metadata: Metadata = {
  title: 'Major Arcana',
}

export default function MajorArcana() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Major Arcana
      </h1>
      <DataList
        items={cards}
        getKey={(c) => c.slug}
        getHref={(c) => `/tarot/${c.slug}`}
        renderRow={(c) => (
          <>
            <span className="flex items-baseline gap-3">
              <IndexLabel>{c.num}</IndexLabel>
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
