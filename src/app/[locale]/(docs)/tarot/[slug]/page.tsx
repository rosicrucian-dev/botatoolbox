import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { getMinorArcana, getTarot } from '@/content/data'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'
import { MajorCard } from './MajorCard'
import { MinorCard } from './MinorCard'

// Structural (slug) enumeration — English source on purpose.
const { minorBySlug } = getMinorArcana(DEFAULT_LOCALE)
const { cards } = getTarot(DEFAULT_LOCALE)

export function generateStaticParams() {
  // Both halves of the deck share /tarot/<slug>. Major cards are also reachable
  // by numeric alias (two entries each); minor cards by their <num>-<suit> slug.
  return [
    ...cards.flatMap((card) => [
      { slug: card.slug },
      { slug: String(card.num) },
    ]),
    ...Object.keys(minorBySlug).map((slug) => ({ slug })),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const major = getTarot(locale).cardBySlugOrNum(slug)
  if (major) return { title: major.name }
  const minor = getMinorArcana(locale).minorBySlug[slug]
  return { title: minor ? `${minor.num} of ${minor.suit}` : 'Card' }
}

// One route for the whole deck. The slug resolves to a major card (named or
// numeric) or a minor card; each renders its own detail layout.
export default async function TarotCardPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const major = getTarot(locale).cardBySlugOrNum(slug)
  if (major)
    return (
      <>
        <SetBreadcrumbs
          items={[
            { label: 'Major Arcana', href: '/tarot/major-arcana' },
            { label: major.name },
          ]}
        />
        <MajorCard card={major} locale={locale} />
      </>
    )
  const minor = getMinorArcana(locale).minorBySlug[slug]
  if (minor)
    return (
      <>
        <SetBreadcrumbs
          items={[
            { label: 'Minor Arcana', href: '/tarot/minor-arcana' },
            { label: `${minor.num} of ${minor.suit}` },
          ]}
        />
        <MinorCard card={minor} locale={locale} />
      </>
    )
  notFound()
}
