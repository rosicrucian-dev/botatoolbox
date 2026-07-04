import { type Metadata } from 'next'

import { PageHeading } from '@/components/PageHeading'
import { alchemyTerms } from '@/content/data'

export const metadata: Metadata = {
  title: 'Alchemy',
}

export default function AlchemyPage() {
  return (
    <article className="space-y-6">
      <PageHeading>Alchemy</PageHeading>

      <dl className="divide-y divide-zinc-950/5 border-y border-zinc-950/5 text-sm/6 dark:divide-white/5 dark:border-white/5">
        {alchemyTerms.map((t) => (
          <div key={t.slug} className="py-4">
            <dt className="font-medium text-zinc-950 dark:text-white">
              {t.term}
            </dt>
            <dd className="mt-1 text-zinc-500 dark:text-zinc-400">
              {t.definition}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
