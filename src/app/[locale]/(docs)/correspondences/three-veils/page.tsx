import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { getThreeVeils } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Three Veils')

// THE THREE VEILS of negative existence — one of the four Qabalah
// tables, a page each since 10 November 2026.
export default async function ThreeVeilsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { threeVeils } = getThreeVeils(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Three Veils' },
        ]}
      />
      <PageHeading>Three Veils</PageHeading>
      <DataTable
        head={['Name', 'Meaning']}
        rows={threeVeils.map((v) => [v.name, v.meaning])}
      />
    </article>
  )
}
