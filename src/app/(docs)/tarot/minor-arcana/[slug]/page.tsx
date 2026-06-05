import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { KeyboardNav } from '@/components/KeyboardNav'
import { PrevNextNav } from '@/components/PrevNextNav'
import { SecretSection } from '@/components/SecretSection'
import { minorBySlug, minorCards, minorImage } from '@/content/data'
import { MinorAttributes } from './MinorAttributes'

export function generateStaticParams() {
  return minorCards.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const card = minorBySlug[slug]
  return { title: card ? `${card.num} of ${card.suit}` : 'Minor Arcana' }
}

export default async function MinorCardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const card = minorBySlug[slug]
  if (!card) notFound()

  // Cyclic prev/next through `minorCards` (Wands → Cups → Swords →
  // Pentacles, Ace through 10 in each suit). Going next from "10 of
  // Wands" lands on "Ace of Cups"; going next from "10 of Pentacles"
  // wraps back to "Ace of Wands".
  const i = minorCards.findIndex((c) => c.slug === card.slug)
  const prev = minorCards[(i - 1 + minorCards.length) % minorCards.length]
  const next = minorCards[(i + 1) % minorCards.length]

  return (
    <article className="space-y-6">
      <KeyboardNav
        prevHref={`/tarot/minor-arcana/${prev.slug}`}
        nextHref={`/tarot/minor-arcana/${next.slug}`}
      />
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
            {card.num} of {card.suit}
          </h1>

          <MinorAttributes
            num={card.num}
            keyword={card.keyword}
            sign={card.sign}
            dates={card.dates}
          />
          {card.meaning && (
            <SecretSection>
              <section className="space-y-3 pt-2">
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Meaning
                </h2>
                {card.meaning.intro && (
                  <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    {card.meaning.intro}
                  </p>
                )}
                {card.meaning.wellDignified && (
                  <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    <span className="font-semibold">Well-Dignified:</span>{' '}
                    {card.meaning.wellDignified}
                  </p>
                )}
                {card.meaning.illDignified && (
                  <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    <span className="font-semibold">Ill-Dignified:</span>{' '}
                    {card.meaning.illDignified}
                  </p>
                )}
                <p className="pt-1 text-xs italic text-zinc-500 dark:text-zinc-400">
                  Warning: This text was extracted with a script and may be
                  inaccurate until manually validated.
                </p>
              </section>
            </SecretSection>
          )}
        </div>

        <div className="md:w-2/5 md:max-w-sm">
          <img
            src={minorImage(card)}
            alt={`${card.num} of ${card.suit}`}
            // Intrinsic dimensions of the colored minor JPEGs
            // (270×466). With `w-full`, the browser computes the
            // aspect ratio from these and reserves vertical space
            // before the bytes load — eliminates the layout flash
            // when navigating prev/next.
            width={270}
            height={466}
            className="w-full rounded-lg shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Image provided by&nbsp;
            <Link
              href="https://joshyates.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Josh Yates
            </Link>
            .
          </p>
        </div>
      </div>

      <PrevNextNav
        prev={{ href: `/tarot/minor-arcana/${prev.slug}`, label: `${prev.num} of ${prev.suit}` }}
        next={{ href: `/tarot/minor-arcana/${next.slug}`, label: `${next.num} of ${next.suit}` }}
      />
    </article>
  )
}
