import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { Dash } from '@/components/ui/TableCells'
import { getAstrology, getChakras, getForces, getTarot } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Seven Forces')

// THE SEVEN FORCES — the seven planets read as the sevenfold operation
// of one Power. The third rung of the Alchemy group's ladder: Three
// Principles, Five Phases, Seven Forces, Twelve Channels.
//
// IT IS THE SAME SEVEN AS /correspondences/planets, deliberately. The
// two tables divide by USE rather than by subject: this one reads them
// as forces of the Work — the interior star, the metal, the angel, the
// power of the Key, the pair of opposites each governs — and Planets
// reads them as astrology. The four interior-star columns came here
// from the chakras table, which is gone, so a fact still has one home;
// what the two tables share is the seven rows and the glyph.
//
// The pair of opposites is forces.json; the power is the Key's, reached
// through the planet's letter, so it cannot drift from the Tarot table.
export default async function ForcesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { planetBySlug } = getAstrology(locale)
  const { chakras } = getChakras(locale)
  const { forces } = getForces(locale)
  const { cardByLetter } = getTarot(locale)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Seven Forces' },
        ]}
      />
      <PageHeading>Seven Forces</PageHeading>
      <DataTable
        head={[
          'Symbol',
          'Force',
          'Power',
          'Pair of opposites',
          'Metal',
          'Center',
          'Angel',
          'Church',
        ]}
        rows={forces.map((f) => {
          const p = planetBySlug[f.slug]
          const star = chakras.find((c) => c.planet === f.slug)
          const pair = f.alsoOpposites
            ? `${f.opposites} (${f.alsoOpposites})`
            : f.opposites
          return [
            <span key="glyph" id={f.slug} className="scroll-mt-24 text-lg/none">
              {p.glyph}
            </span>,
            p.name,
            cardByLetter[p.letter]?.power ?? <Dash key="power" />,
            pair,
            star?.metal ?? <Dash key="metal" />,
            star?.chakra ?? <Dash key="center" />,
            star?.angel ?? <Dash key="angel" />,
            star?.church ?? <Dash key="church" />,
          ]
        })}
      />
    </article>
  )
}
