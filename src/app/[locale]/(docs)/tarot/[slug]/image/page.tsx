import { Link } from '@/components/LocaleLink'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs, type Crumb } from '@/components/Breadcrumbs'
import { MajorImage, MinorImage } from '@/components/CardImage'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import { getMinorArcana, getTarot } from '@/content/data'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { minorBySlug } = getMinorArcana(DEFAULT_LOCALE)
const { cards } = getTarot(DEFAULT_LOCALE)

export function generateStaticParams() {
  // Same slug space as the parent card page (major named + numeric, minor).
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

// A bare, full-width view of a card's high-resolution image — reached by
// clicking the card on its detail page. Title, image at full content width, and
// prev/next nav (arrow keys + footer) that cycle within the same half of the
// deck, staying on the image view.
export default async function TarotCardImagePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const { cards, cardBySlugOrNum } = getTarot(locale)
  const { minorBySlug, minorCards } = getMinorArcana(locale)
  const major = cardBySlugOrNum(slug)
  const minor = major ? undefined : minorBySlug[slug]
  if (!major && !minor) notFound()

  let title: string
  let image: React.ReactNode
  let prev: { href: string; label: string }
  let next: { href: string; label: string }

  const imgClass = 'w-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800'

  if (major) {
    const p = cards.find(
      (c) => c.num === (major.num + cards.length - 1) % cards.length,
    )!
    const n = cards.find((c) => c.num === (major.num + 1) % cards.length)!
    title = major.name
    image = (
      <MajorImage
        card={major}
        alt={title}
        width={724}
        height={1200}
        className={imgClass}
      />
    )
    prev = { href: `/tarot/${p.slug}/image`, label: `${p.num}. ${p.name}` }
    next = { href: `/tarot/${n.slug}/image`, label: `${n.num}. ${n.name}` }
  } else {
    const i = minorCards.findIndex((c) => c.slug === minor!.slug)
    const p = minorCards[(i - 1 + minorCards.length) % minorCards.length]
    const n = minorCards[(i + 1) % minorCards.length]
    title = `${minor!.num} of ${minor!.suit}`
    image = (
      <MinorImage
        card={minor!}
        alt={title}
        width={270}
        height={466}
        className={imgClass}
      />
    )
    prev = { href: `/tarot/${p.slug}/image`, label: `${p.num} of ${p.suit}` }
    next = { href: `/tarot/${n.slug}/image`, label: `${n.num} of ${n.suit}` }
  }

  const backHref = `/tarot/${major ? major.slug : minor!.slug}`

  const crumbs: Array<Crumb> = major
    ? [
        { label: 'Major Arcana', href: '/tarot/major-arcana' },
        { label: title, href: backHref },
        { label: 'Image' },
      ]
    : [
        { label: 'Minor Arcana', href: '/tarot/minor-arcana' },
        { label: title, href: backHref },
        { label: 'Image' },
      ]

  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={crumbs} />
      <KeyboardNav prevHref={prev.href} nextHref={next.href} />
      <div className="flex items-start justify-between gap-4">
        <PageHeading truncate>{title}</PageHeading>
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
      {image}
      <PrevNextNav prev={prev} next={next} />
    </article>
  )
}
