import Link from 'next/link'
import { type Metadata } from 'next'

import { suits } from '@/content/data'
import { IndexLabel } from '@/components/IndexLabel'

export const metadata: Metadata = {
  title: 'Minor Arcana',
}

const ROW =
  '-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50'

export default function MinorArcana() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Minor Arcana
      </h1>
      <div className="grid grid-cols-1 gap-8">
        {suits.map((suit) => (
          <section key={suit.suit}>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {suit.suit}
            </h2>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {suit.cards.map((card) => {
                const slug = `${card.num.toLowerCase()}-${suit.suit.toLowerCase()}`
                return (
                  <li key={card.num}>
                    <Link href={`/tarot/minor-arcana/${slug}`} className={ROW}>
                      <span className="flex items-baseline gap-3">
                        <IndexLabel>{card.num}</IndexLabel>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {card.keyword}
                        </span>
                      </span>
                      <span className="text-zinc-400" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}
