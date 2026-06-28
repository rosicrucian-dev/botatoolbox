'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

import { HeaderChip } from '@/components/HeaderChip'
import {
  quizCategories,
  quizzes,
  type QuizCategory,
} from '@/content/data/quizzes'

const ROW =
  '-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50'

const RANDOMIZE_KEY = 'quiz:randomize'

// Boolean state backed by localStorage. SSR renders with `defaultValue`;
// after mount, useEffect rehydrates from storage (one-frame flicker is
// acceptable for a quiet preference like this). Writes happen only when
// the caller updates the value, so we never overwrite stored state with
// the default during hydration.
function usePersistedToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) setValue(stored === '1')
    } catch {
      // Private browsing / storage disabled — keep the default.
    }
  }, [key])

  const setPersistedValue = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setValue((prev) => {
        const v = typeof next === 'function' ? next(prev) : next
        try {
          localStorage.setItem(key, v ? '1' : '0')
        } catch {
          // Private browsing / storage disabled — fail silently.
        }
        return v
      })
    },
    [key],
  )

  return [value, setPersistedValue] as const
}

export function QuizCatalog() {
  const [randomize, setRandomize] = usePersistedToggle(RANDOMIZE_KEY, false)
  const suffix = randomize ? '?random=1' : ''

  return (
    <article className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Quiz
        </h1>
        <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
          <HeaderChip
            pressed={randomize}
            onClick={() => setRandomize((v) => !v)}
          >
            Randomize
          </HeaderChip>
        </div>
      </div>
      {quizCategories.map((cat) => (
        <Category key={cat.slug} category={cat} linkSuffix={suffix} />
      ))}
    </article>
  )
}

function Category({
  category,
  linkSuffix,
}: {
  category: QuizCategory
  linkSuffix: string
}) {
  const items = quizzes.filter((q) => q.categorySlug === category.slug)
  if (items.length === 0) return null
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        {category.label}
      </h2>
      <ul className="mt-4 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {items.map((q) => (
          <li key={q.slug}>
            <Link
              href={`/quiz/${category.slug}/${q.slug}${linkSuffix}`}
              className={ROW}
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {q.title}
              </span>
              <span className="text-zinc-400" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
