import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { CardGrid } from '@/components/nav/NavCards'
import { getTexts } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Texts')

// THE TEXTS' OWN INDEX. Read from content/data/<locale>/texts.json — the
// manifest's order, titles and descriptions — and not from the nav:
// these were a sidebar group with a row per text until the Library took
// their place (src/lib/navData.ts), and a list that can only grow
// belongs on a page rather than in the sidebar. Hidden texts (the
// Chaldean Oracles) stay out of it and reachable by direct URL, as they
// always were.
export default async function TextsIndex({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { visibleTexts } = getTexts(toLocale((await params).locale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Texts' }]} />
      <PageHeading>Texts</PageHeading>
      <CardGrid
        links={visibleTexts.map((text) => ({
          title: text.title,
          href: `/texts/${text.slug}`,
          description: text.description,
        }))}
      />
    </article>
  )
}
