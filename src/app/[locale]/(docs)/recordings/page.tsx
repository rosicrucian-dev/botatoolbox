import { Button } from '@/components/catalyst/button'
import { PageToolbar } from '@/components/layout/PageToolbar'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { RecordingsSearch } from '@/components/search/RecordingsSearch'
import { DataList } from '@/components/ui/DataList'
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
      <PageToolbar
        title="Recordings"
        // THE RADIO IS AN ACTION, NOT A ROW (November 2026). It was a
        // sidebar row of its own under Resources, and it belongs here:
        // the stream is BOTA NZ's broadcast of these very lectures, and
        // the archive below was captured from it. Not a row of the list,
        // because every row there is a series with a count and a page of
        // transcripts — a live stream has neither, and it would have sat
        // among them as a series with an empty count. A quiet button
        // beside Search says what it is: another way to hear this, now
        // rather than by the page.
        secondaryActions={
          <Button href="/radio" outline>
            Radio
          </Button>
        }
        primaryAction={<RecordingsSearch />}
      />
      <div
        role="note"
        className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200"
      >
        These recordings were transcribed using Whisper, and may contain errors.
        You can help correct any issues on{' '}
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
