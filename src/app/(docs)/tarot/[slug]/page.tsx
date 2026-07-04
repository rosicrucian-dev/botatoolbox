import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { cardBySlugOrNum, cards, minorBySlug } from '@/content/data'
import { MajorCard } from './MajorCard'
import { MinorCard } from './MinorCard'

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
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const major = cardBySlugOrNum(slug)
  if (major) return { title: major.name }
  const minor = minorBySlug[slug]
  return { title: minor ? `${minor.num} of ${minor.suit}` : 'Card' }
}

// One route for the whole deck. The slug resolves to a major card (named or
// numeric) or a minor card; each renders its own detail layout.
export default async function TarotCardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const major = cardBySlugOrNum(slug)
  if (major) return <MajorCard card={major} />
  const minor = minorBySlug[slug]
  if (minor) return <MinorCard card={minor} />
  notFound()
}
