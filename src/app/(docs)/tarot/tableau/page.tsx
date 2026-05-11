import Link from 'next/link'
import { type Metadata } from 'next'

import { cards, thumbImage } from '@/content/data/tarot'

export const metadata: Metadata = {
  title: 'Tableau',
}

const fool = cards.find((c) => c.num === 0)!
const tableau = cards.filter((c) => c.num !== 0)

function CardLink({ card }: { card: (typeof cards)[number] }) {
  return (
    <Link
      href={`/tarot/${card.slug}`}
      className="block transition hover:-translate-y-0.5 hover:opacity-90"
    >
      <img
        src={thumbImage(card)}
        alt={`${card.num}. ${card.name}`}
        width={362}
        height={600}
        loading="lazy"
        className="w-full rounded-md shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
      />
    </Link>
  )
}

export default function Tableau() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Tableau
      </h1>
      <div className="grid grid-cols-7 gap-1 md:gap-3">
        <div className="col-span-7 grid grid-cols-7 gap-1 md:gap-3">
          <div className="col-start-4">
            <CardLink card={fool} />
          </div>
        </div>
        {tableau.map((card) => (
          <CardLink key={card.num} card={card} />
        ))}
      </div>
    </article>
  )
}
