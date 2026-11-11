import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { LinkList } from '@/components/ui/TableCells'
import { getAstrology, getPlanets } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Planets')

// THE PLANETS — one of the three Astrology tables, a page each since 10
// November 2026.
//
// THE INTERIOR-STAR COLUMNS ARE NOT HERE. The metal, the centre in the
// body, the angel and the church went to the Seven Forces, which is the
// Work's reading of the same seven: this table keeps the astrology —
// what each rules and where it is exalted — and no column stands in
// both. The chakras were a table of their own until that day, and every
// column of it was an attribution of the PLANET, so two tables keyed
// alike were one table read twice.
export default async function PlanetsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { astrologyPlanets, signBySlug } = getAstrology(toLocale(rawLocale))
  // THE ROWS ARE IN THE DATA'S OWN ORDER, which is the Sepher
  // Yetzirah's seven Doubles read backwards (Saturn to Mercury) with
  // the three moderns after them -- the order the Seven Forces table
  // takes as well, so the two readings of the same seven can be held
  // side by side. `astrologyPlanets` is sorted for the astrology
  // pages, which is a different question and stays theirs.
  const order = getPlanets(toLocale(rawLocale)).planets.map((p) => p.slug)
  const planets = [...astrologyPlanets].sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug),
  )
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Planets' },
        ]}
      />
      <PageHeading>Planets</PageHeading>
      <DataTable
        head={['Symbol', 'Planet', 'Rules', 'Exaltation', 'Alchemy', 'Color']}
        rows={planets.map((p) => [
          <span key="glyph" id={p.slug} className="scroll-mt-24 text-lg/none">
            {p.glyph}
          </span>,
          p.name,
          <LinkList
            key="rules"
            items={p.rules.map((slug) => signBySlug[slug])}
            hrefBase="/correspondences/signs"
          />,
          <LinkList
            key="exalted"
            items={p.exaltedIn ? [signBySlug[p.exaltedIn]] : []}
            hrefBase="/correspondences/signs"
          />,
          p.alchemy,
          p.color,
        ])}
      />
    </article>
  )
}
