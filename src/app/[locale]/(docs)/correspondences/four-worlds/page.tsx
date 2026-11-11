import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { getFourWorlds } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Four Worlds')

// THE FOUR WORLDS — one of the four Qabalah tables, a page each since
// 10 November 2026.
export default async function FourWorldsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { fourWorlds } = getFourWorlds(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Four Worlds' },
        ]}
      />
      <PageHeading>Four Worlds</PageHeading>
      <DataTable
        head={['World', 'Principle', 'Element']}
        rows={fourWorlds.map((w) => [
          <span key="world" id={w.slug} className="scroll-mt-24">
            {w.world}
          </span>,
          w.principle,
          w.element,
        ])}
      />
    </article>
  )
}
