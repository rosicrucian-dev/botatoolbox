import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Radio')

// BOTA NZ's live stream of the Ann Davies lectures. Reached from the
// Recordings page (a button beside its Search), not from the sidebar:
// the stream and the archive are the same broadcast, and this is the
// one of the two you cannot search. It keeps its sitemap entry and its
// search entry, which name it from the manifest side rather than the
// nav (src/app/sitemap.ts, src/lib/search.ts).
export default function Radio() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Recordings', href: '/recordings' },
          { label: 'Radio' },
        ]}
      />
      <PageHeading>Radio</PageHeading>
      <div
        className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
        style={{ backgroundColor: '#25292c' }}
      >
        <iframe
          src="https://botanz.airtime.pro/embed/player?stream=auto&skin=2"
          title="Ann Davies Radio"
          className="block h-[396px] w-full"
          allow="autoplay"
          style={{ backgroundColor: '#25292c' }}
        />
      </div>
    </article>
  )
}
