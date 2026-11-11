import { PageHeading } from '@/components/layout/PageHeading'
import { Link } from '@/components/locale/LocaleLink'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { MinorImage } from '@/components/tarot/CardImage'
import { getMinorArcana } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { Fragment } from 'react'

export const generateMetadata = localizedMetadata('Minor Arcana')

// THE MINOR ARCANA: a column per suit, Ace to King down it, each card
// opening its own page. The Reference's counterpart to the Major
// Arcana's tableau — the cards as they are LOOKED AT, where
// /correspondences/minor-arcana is the suits' attributions and every
// card's keyword as a table.
//
// Four columns at every width, as the tableau keeps its own shape:
// a suit is a column, and reflowing it to two would put Cups under
// Wands and make the Ace of Swords the ninth card of a column.
export default async function MinorArcana({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { suits, minorBySlug } = getMinorArcana(toLocale(rawLocale))
  const rows = suits[0].cards.map((_, i) => i)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Minor Arcana' }]} />
      <PageHeading>Minor Arcana</PageHeading>
      <div className="grid grid-cols-4 gap-x-2 gap-y-2 sm:gap-x-4 sm:gap-y-3">
        {suits.map((suit) => (
          <h2
            key={suit.suit}
            className="text-center text-sm font-semibold text-zinc-900 dark:text-white"
          >
            {suit.suit}
          </h2>
        ))}
        {rows.map((i) => (
          <Fragment key={i}>
            {suits.map((suit) => {
              const slug = `${suit.cards[i].num.toLowerCase()}-${suit.suit.toLowerCase()}`
              const card = minorBySlug[slug]
              return (
                <Link
                  key={suit.suit}
                  href={`/tarot/${slug}`}
                  className="block transition hover:opacity-80"
                  title={`${card.num} of ${card.suit}`}
                >
                  <MinorImage
                    card={card}
                    alt={`${card.num} of ${card.suit}`}
                    className="w-full rounded"
                    loading="lazy"
                  />
                </Link>
              )
            })}
          </Fragment>
        ))}
      </div>
    </article>
  )
}
