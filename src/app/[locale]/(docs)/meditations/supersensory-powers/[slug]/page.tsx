import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { MajorImage } from '@/components/CardImage'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import { getMeditations, getTarot } from '@/content/data'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { supersensoryMeditations } = getMeditations(DEFAULT_LOCALE)

export function generateStaticParams() {
  return supersensoryMeditations.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  const m = getMeditations(toLocale(rawLocale)).supersensoryBySlug(slug)
  return { title: m ? m.name : 'Supersensory Powers' }
}

export default async function SupersensoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const { supersensoryBySlug, supersensoryMeditations: meditations } =
    getMeditations(locale)
  const entry = supersensoryBySlug(slug)
  if (!entry) notFound()

  const i = meditations.findIndex((m) => m.slug === entry.slug)
  const prev = i > 0 ? meditations[i - 1] : undefined
  const next = i < meditations.length - 1 ? meditations[i + 1] : undefined
  const prevHref = prev
    ? `/meditations/supersensory-powers/${prev.slug}`
    : undefined
  const nextHref = next
    ? `/meditations/supersensory-powers/${next.slug}`
    : undefined

  const card = getTarot(locale).cardBySlug[entry.slug]

  return (
    <article className="space-y-8">
      <SetBreadcrumbs
        items={[
          {
            label: 'Developing Supersensory Powers',
            href: '/meditations/supersensory-powers',
          },
          { label: entry.name },
        ]}
      />
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <PageHeading>{entry.name}</PageHeading>

      {card && (
        <div className="flex justify-center">
          {/* Same 30% width as Tarot Fundamentals so card sizing
              matches across all meditation views. */}
          <MajorImage
            card={card}
            alt={`${card.num}. ${card.name}`}
            width={362}
            height={600}
            className="block w-[30%] shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
          />
        </div>
      )}

      <div className="mx-auto max-w-2xl space-y-4 text-zinc-700 dark:text-zinc-300">
        {entry.paragraphs.map((p, idx) => {
          const isLast =
            !entry.affirmation && idx === entry.paragraphs.length - 1
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
        <p className="pt-2 text-xs text-zinc-500 italic dark:text-zinc-400">
          Warning: This text was extracted with a script and may be inaccurate
          until manually validated.
        </p>
      </div>

      <PrevNextNav
        prev={
          prevHref && prev ? { href: prevHref, label: prev.name } : undefined
        }
        next={
          nextHref && next ? { href: nextHref, label: next.name } : undefined
        }
      />
    </article>
  )
}
