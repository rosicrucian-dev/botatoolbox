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
  // Manifest order is source-folder order (Classes series, then Services last);
  // the landing list reads better sorted alphabetically by title.
  const groupings = [...groupingsInOrder].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { numeric: true }),
  )
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Recordings' }]} />
      <PageToolbar title="Recordings" primaryAction={<RecordingsSearch />} />
      <div
        role="note"
        className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200"
      >
        These recordings were transcribed using Whisper, and may contain
        errors. You can help correct any issues on{' '}
        <a
          href="https://github.com/rosicrucian-dev/botatoolbox"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-100"
        >
          GitHub
        </a>
        .
      </div>
      <DataList
        items={groupings}
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
