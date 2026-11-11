import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { LinkList } from '@/components/ui/TableCells'
import { getAstrology } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Signs')

// THE TWELVE SIGNS — one of the three Astrology tables, a page each
// since 10 November 2026. They were sections of a single /astrology
// page; the Hermetic Order of Aquarius split them that day and this
// site follows, so the two carry the same tables under the same
// headings.
//
// THE BODY COLUMN IS NOT HERE. It went to the Twelve Channels, which is
// the Work's reading of the same twelve: this table keeps the
// astrology — the ruler, the exaltation, the quality, the colour — and
// no column stands in both.
export default async function SignsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { astrologySigns: signs, planetBySlug } = getAstrology(
    toLocale(rawLocale),
  )
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Signs' },
        ]}
      />
      <PageHeading>Signs</PageHeading>
      <DataTable
        head={[
          'Symbol',
          'Sign',
          'Ruler',
          'Exaltation',
          'Description',
          'Quality',
          'Alchemy',
          'Color',
        ]}
        rows={signs.map((s) => [
          <span key="glyph" id={s.slug} className="scroll-mt-24 text-lg/none">
            {s.glyph}
          </span>,
          s.name,
          <LinkList
            key="rulers"
            items={s.rulers.map((slug) => planetBySlug[slug])}
            hrefBase="/correspondences/planets"
          />,
          <LinkList
            key="exalted"
            items={s.exaltedBy ? [planetBySlug[s.exaltedBy]] : []}
            hrefBase="/correspondences/planets"
          />,
          s.symbol,
          s.quality,
          s.alchemicalStage,
          s.color,
        ])}
      />
    </article>
  )
}
