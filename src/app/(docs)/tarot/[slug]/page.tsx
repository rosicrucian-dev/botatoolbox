import { notFound } from 'next/navigation'
import Link from 'next/link'
import { type Metadata } from 'next'

import { Button } from '@/components/Button'
import { DefinitionList } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PlayLink } from '@/components/PlayLink'
import { planetBySlug, signBySlug } from '@/content/data/astrology'
import { cards, cardImage } from '@/content/data/tarot'

const FIELD_ORDER: Array<{
  label: string
  key: keyof (typeof cards)[number]
}> = [
  { label: 'Color', key: 'color' },
  { label: 'Note', key: 'note' },
  { label: 'Letter', key: 'letter' },
  { label: 'Significance', key: 'significance' },
  { label: 'Gematria', key: 'gematria' },
  { label: 'Astrology', key: 'astrology' },
  { label: 'Alchemy', key: 'alchemy' },
  { label: 'Intelligence', key: 'intelligence' },
  { label: 'Power', key: 'power' },
  { label: 'Human', key: 'human' },
]

// Resolve a [slug] segment to a card. Accepts either the named slug
// ('fool', 'high-priestess') or the card number ('0', '1', ..., '21').
function findCard(slug: string) {
  if (/^\d+$/.test(slug)) {
    const n = Number(slug)
    return cards.find((c) => c.num === n)
  }
  return cards.find((c) => c.slug === slug)
}

export function generateStaticParams() {
  // Pre-render every card under both routes: the named slug and the
  // numeric alias. Two entries per card → 44 static pages total.
  return cards.flatMap((card) => [
    { slug: card.slug },
    { slug: String(card.num) },
  ])
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const card = findCard(slug)
  return { title: card?.name ?? 'Card' }
}

export default async function TarotCardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const card = findCard(slug)
  if (!card) notFound()

  const prev = cards.find(
    (c) => c.num === (card.num + cards.length - 1) % cards.length,
  )!
  const next = cards.find((c) => c.num === (card.num + 1) % cards.length)!

  return (
    <article className="space-y-6">
      <KeyboardNav
        prevHref={`/tarot/${prev.slug}`}
        nextHref={`/tarot/${next.slug}`}
      />
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
              {card.name}
            </h1>
            <PlayLink href={`/tarot/major-arcana/play?idx=${card.num}`}>
              Focus ▶
            </PlayLink>
          </div>

          <DefinitionList
            rows={FIELD_ORDER.map(({ label, key }) => {
              const raw = String(card[key])
              // The Astrology cell links to the corresponding planet or
              // sign detail page. Slug is just the lowercased name —
              // every card's astrology resolves to either a planet or
              // sign (enforced by integrity.ts at boot).
              if (key === 'astrology') {
                const astroSlug = card.astrology.toLowerCase()
                const href = planetBySlug[astroSlug]
                  ? `/astrology/planets/${astroSlug}`
                  : signBySlug[astroSlug]
                    ? `/astrology/signs/${astroSlug}`
                    : null
                if (href) {
                  return {
                    label,
                    value: (
                      <Link
                        href={href}
                        className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                      >
                        {raw}
                      </Link>
                    ),
                  }
                }
              }
              return { label, value: raw }
            })}
          />
        </div>

        <div className="md:w-2/5 md:max-w-sm">
          <img
            src={cardImage(card)}
            alt={`${card.num}. ${card.name}`}
            width={400}
            height={680}
            className="w-full rounded-lg shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
          />
        </div>
      </div>

      <nav className="flex">
        <div className="flex flex-col items-start gap-3">
          <Button
            href={`/tarot/${prev.slug}`}
            aria-label={`Previous: ${prev.num}. ${prev.name}`}
            variant="secondary"
            arrow="left"
          >
            Previous
          </Button>
          <Link
            href={`/tarot/${prev.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="text-base font-semibold text-zinc-900 transition hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
          >
            {prev.num}. {prev.name}
          </Link>
        </div>
        <div className="ml-auto flex flex-col items-end gap-3">
          <Button
            href={`/tarot/${next.slug}`}
            aria-label={`Next: ${next.num}. ${next.name}`}
            variant="secondary"
            arrow="right"
          >
            Next
          </Button>
          <Link
            href={`/tarot/${next.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="text-base font-semibold text-zinc-900 transition hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
          >
            {next.num}. {next.name}
          </Link>
        </div>
      </nav>
    </article>
  )
}
