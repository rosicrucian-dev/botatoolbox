import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { TextLink } from '@/components/ui/TextLink'
import { getMinorArcana } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Minor Arcana')

// THE FOUR SUITS, CARD BY CARD: each suit's fourteen cards with their
// keyword, sign and dates.
//
// It is the Hermetic Order of Aquarius's cut (10 November 2026). This
// page was the SUITS' table — Tarot, Playing card, World, Element,
// Letter — four rows about the suits and nothing about the 56 cards;
// that table is at the foot of /correspondences/major-arcana now, as
// it is there, and this page is the cards.
//
// WHAT IS NOT TAKEN FROM THAT SITE is the grid of card pictures above
// each suit's table. /minor-arcana is the cards as pictures and this
// is the table, which is a line this site drew when the Tarot group
// was broken up (see /tarot/minor-arcana's own note) and which that
// site has not: its two Minor Arcana pages are an open question of its
// own, not a shape to copy.
export default async function MinorArcana({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { suits, minorCards } = getMinorArcana(toLocale(rawLocale))
  return (
    <article className="space-y-8">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Minor Arcana' },
        ]}
      />
      <PageHeading>Minor Arcana</PageHeading>

      {suits.map((suit) => (
        <section key={suit.suit} className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {suit.suit}
          </h2>
          <DataTable
            head={['Card', 'Keyword', 'Sign', 'Dates']}
            rows={minorCards
              .filter((c) => c.suit === suit.suit)
              .map((c) => [
                <TextLink key={c.slug} href={`/tarot/${c.slug}`}>
                  {c.num}
                </TextLink>,
                c.keyword,
                c.sign,
                c.dates,
              ])}
          />
        </section>
      ))}
    </article>
  )
}
