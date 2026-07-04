import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MajorImage } from '@/components/CardImage'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import {
  cardBySlug,
  dayBySlug,
  isRestDay,
  neighborDays,
  tarotFundamentalsDays,
} from '@/content/data'

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
  const prevHref = prev
    ? `/meditations/tarot-fundamentals/day-${prev}`
    : undefined
  const nextHref = next
    ? `/meditations/tarot-fundamentals/day-${next}`
    : undefined

  return (
    <article className="space-y-8">
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <PageHeading>Day {entry.day}</PageHeading>

      {/* 30% × 3 cards + 5% × 2 gaps = 100% of article width — matches
          Freeform so three cards fit on one line on any size screen. */}
      <div className="flex flex-wrap items-start justify-center gap-x-[5%] gap-y-2 md:gap-y-4">
        {entry.cards.map((slug) => {
          const card = cardBySlug[slug]
          if (!card) return null
          return (
            <MajorImage
              key={slug}
              card={card}
              alt={`${card.num}. ${card.name}`}
              width={362}
              height={600}
              className="block w-[30%] shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
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

      <PrevNextNav
        prev={
          prevHref && prev !== undefined
            ? { href: prevHref, label: `Day ${prev}` }
            : undefined
        }
        next={
          nextHref && next !== undefined
            ? { href: nextHref, label: `Day ${next}` }
            : undefined
        }
      />
    </article>
  )
}
