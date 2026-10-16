import { Link } from '@/components/locale/LocaleLink'

import { PageHeading } from '@/components/layout/PageHeading'
import { PrevNextGestures } from '@/components/nav/PrevNextGestures'
import { PrevNextNav } from '@/components/nav/PrevNextNav'
import { MinorImage } from '@/components/tarot/CardImage'
import { getMinorArcana, type MinorEntry } from '@/content/data'
import { type Locale } from '@/lib/locales'
import { privateMinorMeaning } from '@/lib/privatePages'
import { CardImageLink } from './CardImageLink'
import { CardStack } from './CardStack'
import { MinorAttributes } from './MinorAttributes'

// The minor-arcana card detail. Served at /tarot/<slug> alongside the major
// arcana (see <MajorCard>). Prev/next cycle within the 56 minor cards.
export function MinorCard({
  card,
  locale,
}: {
  card: MinorEntry
  locale: Locale
}) {
  const { minorCards } = getMinorArcana(locale)
  const i = minorCards.findIndex((c) => c.slug === card.slug)
  const prev = minorCards[(i - 1 + minorCards.length) % minorCards.length]
  const next = minorCards[(i + 1) % minorCards.length]
  const meaning = privateMinorMeaning(locale, card.slug)

  return (
    <article className="space-y-6">
      <PrevNextGestures
        prevHref={`/tarot/${prev.slug}`}
        nextHref={`/tarot/${next.slug}`}
      />
      <CardStack
        header={
          <PageHeading truncate>
            {card.num} of {card.suit}
          </PageHeading>
        }
        meta={
          <div className="space-y-4">
            <MinorAttributes
              locale={locale}
              num={card.num}
              keyword={card.keyword}
              sign={card.sign}
              dates={card.dates}
            />
            {meaning && (
              <section className="space-y-3 pt-2">
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Meaning
                </h2>
                {meaning.intro && (
                  <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    {meaning.intro}
                  </p>
                )}
                {meaning.wellDignified && (
                  <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    <span className="font-semibold">Well-Dignified:</span>{' '}
                    {meaning.wellDignified}
                  </p>
                )}
                {meaning.illDignified && (
                  <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    <span className="font-semibold">Ill-Dignified:</span>{' '}
                    {meaning.illDignified}
                  </p>
                )}
                <p className="pt-1 text-xs text-zinc-500 italic dark:text-zinc-400">
                  Warning: This text was extracted with a script and may be
                  inaccurate until manually validated.
                </p>
              </section>
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
