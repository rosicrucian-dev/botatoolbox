import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { getSephiroth } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Sephiroth')

// THE TEN SEPHIROTH — one of the four Qabalah tables, a page each since
// 10 November 2026. NUMBERED FROM KETHER DOWN, which is how they are
// always counted, where the data lists them from Malkuth up.
export default async function SephirothPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { sephiroth } = getSephiroth(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Sephiroth' },
        ]}
      />
      <PageHeading>Sephiroth</PageHeading>
      <DataTable
        head={['#', 'Sephirah', 'Meaning', 'Astrological']}
        rows={[...sephiroth].reverse().map((s, i) => [
          i + 1,
          <span key="name" id={s.slug} className="scroll-mt-24">
            {`${s.hebrewName} (${s.hebrewRoman})`}
          </span>,
          s.name,
          s.astrological,
        ])}
      />
    </article>
  )
}
