import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DataList } from '@/components/DataList'
import { PageHeading } from '@/components/PageHeading'
import { getRecordings } from '@/content/data'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { groupingsInOrder } = getRecordings(DEFAULT_LOCALE)

export function generateStaticParams() {
  return groupingsInOrder.map((g) => ({ group: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; group: string }>
}) {
  const { locale, group } = await params
  const g = getRecordings(toLocale(locale)).groupingsInOrder.find(
    (x) => x.slug === group,
  )
  return { title: g ? `${g.title} — Recordings` : 'Recordings' }
}

function minutes(sec: number): string {
  return `${Math.round(sec / 60)} min`
}

export default async function RecordingGroup({
  params,
}: {
  params: Promise<{ locale: string; group: string }>
}) {
  const { locale: rawLocale, group } = await params
  const locale = toLocale(rawLocale)
  const { recordings, groupingsInOrder } = getRecordings(locale)
  const grouping = groupingsInOrder.find((g) => g.slug === group)
  if (!grouping) notFound()

  const items = recordings.filter((r) => r.groupingSlug === group)
  // Only reserve the tape-number column for groupings that actually have
  // catalog numbers (Services). Class series have none, so titles start flush.
  const hasNumbers = items.some((r) => r.catalogNumber)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Recordings', href: '/recordings' },
          { label: grouping.title },
        ]}
      />
      <PageHeading>{grouping.title}</PageHeading>
      <DataList
        items={items}
        getKey={(r) => r.slug}
        getHref={(r) => `/recordings/${r.groupingSlug}/${r.slug}`}
        renderRow={(r) => (
          <>
            <span className="flex min-w-0 items-baseline gap-3">
              {/* Fixed-width so titles align regardless of tape-number length
                  (5C vs 10A). Rendered only for numbered groupings (Services);
                  unnumbered class series skip the column entirely. */}
              {hasNumbers && (
                <span className="w-9 shrink-0 font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                  {r.catalogNumber}
                </span>
              )}
              <span className="truncate text-zinc-900 dark:text-zinc-100">
                {r.title}
              </span>
            </span>
            <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {minutes(r.durationSeconds)}
            </span>
          </>
        )}
      />
    </article>
  )
}
