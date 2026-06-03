import Link from 'next/link'
import { type Metadata } from 'next'

import { grades } from '@/content/data'

export const metadata: Metadata = {
  title: 'Grades',
}

const ROW =
  '-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 transition'

export default function GradesPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Grades
      </h1>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {grades.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/grades/${g.slug}`}
              className={`${ROW} hover:bg-zinc-50 dark:hover:bg-zinc-800/50`}
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {g.name}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-sm text-zinc-500 tabular-nums dark:text-zinc-400">
                  {g.gradeNumber}
                </span>
                <span className="text-zinc-400" aria-hidden>
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
