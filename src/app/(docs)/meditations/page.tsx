import { type Metadata } from 'next'

import { DataList } from '@/components/DataList'
import { PageHeading } from '@/components/PageHeading'
import { navigation } from '@/lib/nav'

export const metadata: Metadata = {
  title: 'Meditations',
}

const links = navigation.find((g) => g.title === 'Meditations')?.links ?? []

export default function Meditations() {
  return (
    <article className="space-y-6">
      <PageHeading>Meditations</PageHeading>
      <DataList
        items={links}
        getKey={(l) => l.href}
        getHref={(l) => l.href}
        renderRow={(l) => (
          <>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {l.title}
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
