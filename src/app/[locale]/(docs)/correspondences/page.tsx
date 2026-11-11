import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { CardGrid } from '@/components/nav/NavCards'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { getTableGroups } from '@/lib/tables'

export const generateMetadata = localizedMetadata('Correspondences')

// THE TABLES' OWN INDEX. The eight tables were eight sidebar rows under
// Reference — a third of the sidebar — and the Reference is five rows
// now, with this page behind the first of them. The list and its
// headings are src/lib/tables.ts; the cards' words are the message
// catalog's, the same keys the sidebar rows used.
export default async function Correspondences({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const groups = getTableGroups(toLocale((await params).locale))
  return (
    <article className="space-y-10">
      <SetBreadcrumbs items={[{ label: 'Correspondences' }]} />
      <PageHeading>Correspondences</PageHeading>
      {groups.map(({ group, tables }) => (
        <section key={group}>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {group}
          </h2>
          <div className="mt-4 border-t border-zinc-900/5 pt-8 dark:border-white/5">
            <CardGrid links={tables.map(({ href, title, description }) => ({ href, title, description }))} />
          </div>
        </section>
      ))}
    </article>
  )
}
