import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { Button } from '@/components/Button'
import { KeyboardNav } from '@/components/KeyboardNav'
import {
  supersensoryBySlug,
  supersensoryMeditations,
} from '@/content/data/meditations'
import { cardBySlug, cardImage } from '@/content/data/tarot'

export function generateStaticParams() {
  return supersensoryMeditations.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const m = supersensoryBySlug(slug)
  return { title: m ? m.name : 'Supersensory Powers' }
}

export default async function SupersensoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = supersensoryBySlug(slug)
  if (!entry) notFound()

  const i = supersensoryMeditations.findIndex((m) => m.slug === entry.slug)
  const prev = i > 0 ? supersensoryMeditations[i - 1] : undefined
  const next =
    i < supersensoryMeditations.length - 1
      ? supersensoryMeditations[i + 1]
      : undefined
  const prevHref = prev
    ? `/meditations/supersensory-powers/${prev.slug}`
    : undefined
  const nextHref = next
    ? `/meditations/supersensory-powers/${next.slug}`
    : undefined

  const card = cardBySlug[entry.slug]

  return (
    <article className="space-y-8">
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        {entry.name}
      </h1>

      {card && (
        <div className="flex justify-center">
          <img
            src={cardImage(card)}
            alt={`${card.num}. ${card.name}`}
            width={362}
            height={600}
            className="w-40 rounded-md shadow-sm ring-1 ring-zinc-200 sm:w-48 md:w-56 dark:ring-zinc-800"
          />
        </div>
      )}

      <div className="mx-auto max-w-2xl space-y-4 text-zinc-700 dark:text-zinc-300">
        {entry.paragraphs.map((p, idx) => {
          const isLast = !entry.affirmation && idx === entry.paragraphs.length - 1
          return (
            <p key={idx} className={isLast ? 'font-bold' : undefined}>
              {p}
            </p>
          )
        })}
        {entry.affirmation && (
          <p className="font-bold text-zinc-900 dark:text-white">
            {entry.affirmation}
          </p>
        )}
        <p className="pt-2 text-xs italic text-zinc-500 dark:text-zinc-400">
          Warning: This text was extracted with a script and may be inaccurate
          until manually validated.
        </p>
      </div>

      <nav className="flex">
        {prevHref && prev && (
          <div className="flex flex-col items-start gap-3">
            <Button
              href={prevHref}
              aria-label={`Previous: ${prev.name}`}
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
              {prev.name}
            </Link>
          </div>
        )}
        {nextHref && next && (
          <div className="ml-auto flex flex-col items-end gap-3">
            <Button
              href={nextHref}
              aria-label={`Next: ${next.name}`}
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
              {next.name}
            </Link>
          </div>
        )}
      </nav>
    </article>
  )
}
