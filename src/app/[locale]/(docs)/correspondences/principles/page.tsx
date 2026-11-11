import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { getGunas } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Three Principles')

// THE THREE PRINCIPLES OF ALCHEMY — Sulphur, Mercury and Salt — which
// are the three gunas of Yoga philosophy. The first rung of the Alchemy
// group's ladder: Three Principles, Five Phases, Seven Forces, Twelve
// Channels.
//
// The table was headed Gunas and stood under Alchemy all along, because
// THE GUNAS HAVE NO SIGIL OF THEIR OWN: its first column is the tria
// prima's glyph, which is what the teaching maps them to, so it is
// named for what keys it.
//
// `principle` in gunas.json is the guna's NATURE, which this table
// calls Nature, the word Principle having gone to the top. The cells
// read "Sulfur" where Case writes "Sulphur" — a spelling to fix in the
// data repository, where the fact lives.
export default async function PrinciplesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { gunas } = getGunas(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Three Principles' },
        ]}
      />
      <PageHeading>Three Principles</PageHeading>
      <DataTable
        head={[
          'Symbol',
          'Principle',
          'Guna',
          'Element',
          'Color',
          'Consciousness',
          'Nature',
        ]}
        rows={gunas.map((g) => [
          <span key="glyph" id={g.slug} className="scroll-mt-24 text-lg/none">
            {g.glyph}
          </span>,
          g.alchemy,
          g.guna,
          g.element,
          g.color,
          g.consciousness,
          g.principle,
        ])}
      />
    </article>
  )
}
