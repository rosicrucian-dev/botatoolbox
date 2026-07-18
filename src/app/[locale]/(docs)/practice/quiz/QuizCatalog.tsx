'use client'

import { DataList } from '@/components/DataList'
import { HeaderChip } from '@/components/HeaderChip'
import { PageHeading } from '@/components/PageHeading'
import type { Quiz, QuizCategory } from '@/content/data'
import { usePersistedToggle } from '@/lib/usePersistedToggle'

const RANDOMIZE_KEY = 'quiz:randomize'

// quizzes/quizCategories come from the server page's getQuizzes(locale)
// so the quiz definitions stay out of the client bundle.
export function QuizCatalog({
  quizzes,
  quizCategories,
}: {
  quizzes: ReadonlyArray<Quiz>
  quizCategories: ReadonlyArray<QuizCategory>
}) {
  const [randomize, setRandomize] = usePersistedToggle(RANDOMIZE_KEY, false)
  const suffix = randomize ? '?random=1' : ''

  return (
    <article className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <PageHeading truncate>Quiz</PageHeading>
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
        <Category
          key={cat.slug}
          category={cat}
          quizzes={quizzes}
          linkSuffix={suffix}
        />
      ))}
    </article>
  )
}

function Category({
  category,
  quizzes,
  linkSuffix,
}: {
  category: QuizCategory
  quizzes: ReadonlyArray<Quiz>
  linkSuffix: string
}) {
  const items = quizzes.filter((q) => q.categorySlug === category.slug)
  if (items.length === 0) return null
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        {category.label}
      </h2>
      <DataList
        items={items}
        player
        className="mt-4 border-t border-zinc-200 dark:border-zinc-800"
        getKey={(q) => q.slug}
        getHref={(q) =>
          `/practice/quiz/${category.slug}/${q.slug}${linkSuffix}`
        }
        renderRow={(q) => (
          <>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {q.title}
            </span>
            <span className="text-zinc-400" aria-hidden>
              →
            </span>
          </>
        )}
      />
    </section>
  )
}
