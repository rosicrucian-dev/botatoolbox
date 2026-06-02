import { type Metadata } from 'next'

import { DataList } from '@/components/DataList'
import { planets, signs } from '@/content/data/astrology'

export const metadata: Metadata = {
  title: 'Astrology',
}

export default function Astrology() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Astrology
      </h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Planets
        </h2>
        <DataList
          items={planets}
          getKey={(p) => p.slug}
          getHref={(p) => `/astrology/planets/${p.slug}`}
          renderRow={(p) => (
            <>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {p.name}
              </div>
              <span className="inline-block w-7 text-center text-2xl leading-none text-zinc-900 dark:text-zinc-100">
                {p.symbol}
              </span>
            </>
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Signs
        </h2>
        <DataList
          items={signs}
          getKey={(s) => s.slug}
          getHref={(s) => `/astrology/signs/${s.slug}`}
          renderRow={(s) => (
            <>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {s.name}
              </div>
              <span className="text-2xl leading-none text-zinc-900 dark:text-zinc-100">
                {s.symbol}
              </span>
            </>
          )}
        />
      </section>
    </article>
  )
}
