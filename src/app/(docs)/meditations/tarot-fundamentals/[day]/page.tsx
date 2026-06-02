import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { Button } from '@/components/Button'
import { KeyboardNav } from '@/components/KeyboardNav'
import {
  dayBySlug,
  isRestDay,
  neighborDays,
  tarotFundamentalsDays,
} from '@/content/data/meditations'
import { cardBySlug, cardImage } from '@/content/data/tarot'

export function generateStaticParams() {
  return tarotFundamentalsDays
    .filter((d) => !isRestDay(d.day))
    .map((d) => ({ day: `day-${d.day}` }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ day: string }>
}): Promise<Metadata> {
  const { day } = await params
  const entry = dayBySlug(day)
  return { title: entry ? `Day ${entry.day}` : 'Tarot Fundamentals' }
}

export default async function TarotFundamentalsDayPage({
  params,
}: {
  params: Promise<{ day: string }>
}) {
  const { day } = await params
  const entry = dayBySlug(day)
  if (!entry || isRestDay(entry.day)) notFound()

  const { prev, next } = neighborDays(entry.day)
  const prevHref = prev ? `/meditations/tarot-fundamentals/day-${prev}` : undefined
  const nextHref = next ? `/meditations/tarot-fundamentals/day-${next}` : undefined

  return (
    <article className="space-y-8">
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Day {entry.day}
      </h1>

      <div className="flex flex-wrap items-start justify-center gap-4">
        {entry.cards.map((slug) => {
          const card = cardBySlug[slug]
          if (!card) return null
          return (
            <img
              key={slug}
              src={cardImage(card)}
              alt={`${card.num}. ${card.name}`}
              width={362}
              height={600}
              className="w-40 rounded-md shadow-sm ring-1 ring-zinc-200 sm:w-48 md:w-56 dark:ring-zinc-800"
            />
          )
        })}
      </div>

      {entry.paragraph && (
        <p className="mx-auto max-w-2xl text-center text-zinc-700 dark:text-zinc-300">
          {entry.paragraph}
        </p>
      )}

      {entry.affirmation && (
        <p className="mx-auto max-w-2xl text-center text-lg font-bold text-zinc-900 dark:text-white">
          {entry.affirmation}
        </p>
      )}

      <nav className="flex">
        {prevHref && prev !== undefined && (
          <div className="flex flex-col items-start gap-3">
            <Button
              href={prevHref}
              aria-label={`Previous: Day ${prev}`}
              variant="secondary"
              arrow="left"
            >
              Previous
            </Button>
            <Link
              href={prevHref}
              tabIndex={-1}
              aria-hidden="true"
              className="text-base font-semibold text-zinc-900 transition hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
            >
              Day {prev}
            </Link>
          </div>
        )}
        {nextHref && next !== undefined && (
          <div className="ml-auto flex flex-col items-end gap-3">
            <Button
              href={nextHref}
              aria-label={`Next: Day ${next}`}
              variant="secondary"
              arrow="right"
            >
              Next
            </Button>
            <Link
              href={nextHref}
              tabIndex={-1}
              aria-hidden="true"
              className="text-base font-semibold text-zinc-900 transition hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
            >
              Day {next}
            </Link>
          </div>
        )}
      </nav>
    </article>
  )
}
