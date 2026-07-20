import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DataList } from '@/components/DataList'
import { PageToolbar } from '@/components/PageToolbar'
import { RecordingsSearch } from '@/components/RecordingsSearch'
import { getRecordings } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return { title: localizedTitle(locale, 'Recordings') }
}

export default async function Recordings({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { groupingsInOrder } = getRecordings(toLocale((await params).locale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Recordings' }]} />
      <PageToolbar title="Recordings" primaryAction={<RecordingsSearch />} />
      <DataList
        items={groupingsInOrder}
        getKey={(g) => g.slug}
        getHref={(g) => `/recordings/${g.slug}`}
        renderRow={(g) => (
          <>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {g.title}
            </span>
            <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {g.count} {g.count === 1 ? 'recording' : 'recordings'}
            </span>
          </>
        )}
      />
    </article>
  )
}
