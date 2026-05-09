import { type Metadata } from 'next'

import { IndexLabel } from '@/components/IndexLabel'
import { PlayLink } from '@/components/PlayLink'
import { statements } from '@/content/texts/pattern-trestleboard'

export const metadata: Metadata = {
  title: 'The Pattern on the Trestleboard',
}

export default function Trestleboard() {
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          The Pattern on the Trestleboard
        </h1>
        <PlayLink href="/texts/pattern-trestleboard/play">Start Pattern ▶</PlayLink>
      </div>
      <ol>
        {statements.map((s, i) => (
          <li key={i}>
            <PlayLink
              href={`/texts/pattern-trestleboard/play?idx=${i}`}
              className="-mx-2 flex items-baseline gap-3 rounded-sm px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <IndexLabel>{s.label}</IndexLabel>
              <p className="max-w-prose leading-relaxed text-zinc-700 dark:text-zinc-400">
                {s.text}
              </p>
            </PlayLink>
          </li>
        ))}
      </ol>
    </article>
  )
}
