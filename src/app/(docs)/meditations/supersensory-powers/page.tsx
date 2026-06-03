import Link from 'next/link'
import { type Metadata } from 'next'

import { supersensoryMeditations } from '@/content/data/meditations'

export const metadata: Metadata = {
  title: 'Developing Supersensory Powers',
}

const ROW =
  '-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 transition'

export default function SupersensoryIndex() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Developing Supersensory Powers
      </h1>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {supersensoryMeditations.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/meditations/supersensory-powers/${m.slug}`}
              className={`${ROW} hover:bg-zinc-50 dark:hover:bg-zinc-800/50`}
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {m.name}
              </span>
              <span className="text-zinc-400" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
