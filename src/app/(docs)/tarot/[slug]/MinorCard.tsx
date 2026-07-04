import { Link } from 'next-view-transitions'

import { MinorImage } from '@/components/CardImage'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import { SecretSection } from '@/components/SecretSection'
import { minorCards, type MinorEntry } from '@/content/data'
import { CardImageLink } from './CardImageLink'
import { CardStack } from './CardStack'
import { MinorAttributes } from './MinorAttributes'

// The minor-arcana card detail. Served at /tarot/<slug> alongside the major
// arcana (see <MajorCard>). Prev/next cycle within the 56 minor cards.
export function MinorCard({ card }: { card: MinorEntry }) {
  const i = minorCards.findIndex((c) => c.slug === card.slug)
  const prev = minorCards[(i - 1 + minorCards.length) % minorCards.length]
  const next = minorCards[(i + 1) % minorCards.length]

  return (
    <article className="space-y-6">
      <KeyboardNav
        prevHref={`/tarot/${prev.slug}`}
        nextHref={`/tarot/${next.slug}`}
      />
      <CardStack
        header={
          <PageHeading>
            {card.num} of {card.suit}
          </PageHeading>
        }
        meta={
          <div className="space-y-4">
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
                  <p className="pt-1 text-xs text-zinc-500 italic dark:text-zinc-400">
                    Warning: This text was extracted with a script and may be
                    inaccurate until manually validated.
                  </p>
                </section>
              </SecretSection>
            )}
          </div>
        }
        image={
          <>
            <CardImageLink
              imageHref={`/tarot/${card.slug}/image`}
              nextHref={`/tarot/${next.slug}`}
            >
              <MinorImage
                card={card}
                alt={`${card.num} of ${card.suit}`}
                // Intrinsic dimensions of the colored minor JPEGs
                // (270×466). With `w-full`, the browser computes the
                // aspect ratio from these and reserves vertical space
                // before the bytes load — eliminates the layout flash
                // when navigating prev/next.
                width={270}
                height={466}
                className="w-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
              />
            </CardImageLink>
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
          </>
        }
      />

      <PrevNextNav
        prev={{
          href: `/tarot/${prev.slug}`,
          label: `${prev.num} of ${prev.suit}`,
        }}
        next={{
          href: `/tarot/${next.slug}`,
          label: `${next.num} of ${next.suit}`,
        }}
      />
    </article>
  )
}
