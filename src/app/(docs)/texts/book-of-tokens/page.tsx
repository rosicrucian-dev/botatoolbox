import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DataList } from '@/components/DataList'
import { PageHeading } from '@/components/PageHeading'
import { chapters } from '@/content/texts/book-of-tokens'

export const metadata: Metadata = {
  title: 'The Book of Tokens',
}

// Index of the meditations — the app's standard divided list (DataList),
// each row linking to its own page at /texts/book-of-tokens/<slug>.
export default function BookOfTokens() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'The Book of Tokens' }]} />
      <PageHeading>The Book of Tokens</PageHeading>
      <DataList
        items={chapters}
        getKey={(c) => c.slug}
        getHref={(c) => `/texts/book-of-tokens/${c.slug}`}
        renderRow={(c) => (
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {c.title}
          </span>
        )}
      />
    </article>
  )
}
