import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataList } from '@/components/ui/DataList'
import { getTexts } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Texts')

// THE TEXTS' OWN INDEX. Read from content/data/<locale>/texts.json — the
// manifest's order and titles — and not from the nav: these were a
// sidebar group with a row per text until the Library took their place
// (src/lib/navData.ts), and a list that can only grow belongs on a page
// rather than in the sidebar. Hidden texts (the Chaldean Oracles) stay
// out of it and reachable by direct URL, as they always were.
//
// A LIST, as /recordings is, and not the card grid the group landing
// drew: the manifest gives a text a title and nothing else, so every
// card was a title in a large empty box. `DataList` is the app's list
// page, and a row here is the title alone — the other shelf's rows
// carry a count because a series has a size, and a text does not.
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
      <DataList
        items={visibleTexts}
        getKey={(text) => text.slug}
        getHref={(text) => `/texts/${text.slug}`}
        renderRow={(text) => (
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {text.title}
          </span>
        )}
      />
    </article>
  )
}
