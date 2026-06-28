import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { KeyboardNav } from '@/components/KeyboardNav'
import { PrevNextNav } from '@/components/PrevNextNav'
import { cards, cardBySlugOrNum, cardImage } from '@/content/data/tarot'
import { minorBySlug, minorCards, minorImage } from '@/content/data'

export function generateStaticParams() {
  // Same slug space as the parent card page (major named + numeric, minor).
  return [
    ...cards.flatMap((card) => [{ slug: card.slug }, { slug: String(card.num) }]),
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

// A bare, full-width view of a card's high-resolution image — reached by
// clicking the card on its detail page. Title, image at full content width, and
// prev/next nav (arrow keys + footer) that cycle within the same half of the
// deck, staying on the image view.
export default async function TarotCardImagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const major = cardBySlugOrNum(slug)
  const minor = major ? undefined : minorBySlug[slug]
  if (!major && !minor) notFound()

  let title: string
  let src: string
  let dims: { width: number; height: number }
  let prev: { href: string; label: string }
  let next: { href: string; label: string }

  if (major) {
    const p = cards.find(
      (c) => c.num === (major.num + cards.length - 1) % cards.length,
    )!
    const n = cards.find((c) => c.num === (major.num + 1) % cards.length)!
    title = major.name
    src = cardImage(major)
    dims = { width: 724, height: 1200 }
    prev = { href: `/tarot/${p.slug}/image`, label: `${p.num}. ${p.name}` }
    next = { href: `/tarot/${n.slug}/image`, label: `${n.num}. ${n.name}` }
  } else {
    const i = minorCards.findIndex((c) => c.slug === minor!.slug)
    const p = minorCards[(i - 1 + minorCards.length) % minorCards.length]
    const n = minorCards[(i + 1) % minorCards.length]
    title = `${minor!.num} of ${minor!.suit}`
    src = minorImage(minor!)
    dims = { width: 270, height: 466 }
    prev = { href: `/tarot/${p.slug}/image`, label: `${p.num} of ${p.suit}` }
    next = { href: `/tarot/${n.slug}/image`, label: `${n.num} of ${n.suit}` }
  }

  const backHref = `/tarot/${major ? major.slug : minor!.slug}`

  return (
    <article className="space-y-6">
      <KeyboardNav prevHref={prev.href} nextHref={next.href} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          {title}
        </h1>
        <Link
          href={backHref}
          aria-label="Back to card details"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </div>
      <img
        src={src}
        alt={title}
        width={dims.width}
        height={dims.height}
        className="w-full rounded-lg shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
      />
      <PrevNextNav prev={prev} next={next} />
    </article>
  )
}
