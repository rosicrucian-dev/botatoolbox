import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { getHouses } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Houses')

// THE TWELVE HOUSES — one of the three Astrology tables, a page each
// since 10 November 2026. Keyed on the NUMBER, which is how a house is
// named and how it is looked up.
export default async function HousesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { houses } = getHouses(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Houses' },
        ]}
      />
      <PageHeading>Houses</PageHeading>
      <DataTable
        head={['House', 'Definition']}
        rows={houses.map((h) => [
          <span key="num" id={`house-${h.num}`} className="scroll-mt-24">
            {h.num}
          </span>,
          h.definition,
        ])}
      />
    </article>
  )
}
