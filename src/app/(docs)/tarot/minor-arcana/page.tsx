import { type Metadata } from 'next'

import { suits } from '@/content/data'
import { IndexLabel } from '@/components/IndexLabel'

export const metadata: Metadata = {
  title: 'Minor Arcana',
}

export default function MinorArcana() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Minor Arcana
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Keywords</p>
      </header>
      <div className="grid grid-cols-1 gap-8">
        {suits.map((suit) => (
          <section key={suit.suit}>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {suit.suit}
            </h2>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {suit.cards.map((card) => (
                <li key={card.num}>
                  <div className="-mx-2 flex items-baseline gap-3 rounded-sm px-2 py-3">
                    <IndexLabel>{card.num}</IndexLabel>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {card.keyword}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}
