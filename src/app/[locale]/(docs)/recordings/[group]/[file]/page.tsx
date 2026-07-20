import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { RecordingPlayer } from '@/components/RecordingPlayer'
import { TranscriptBody } from '@/components/TranscriptBody'
import { getRecordings } from '@/content/data'
import { readLocalizedMarkdown } from '@/content/markdown'
import { DEFAULT_LOCALE, toLocale, type Locale } from '@/lib/locales'
import { recordingAudioUrl } from '@/lib/recordings-audio'

// Structural (slug) enumeration — English source on purpose.
const { recordings } = getRecordings(DEFAULT_LOCALE)

export function generateStaticParams() {
  return recordings.map((r) => ({ group: r.groupingSlug, file: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; group: string; file: string }>
}): Promise<Metadata> {
  const { locale, file } = await params
  return {
    title: getRecordings(toLocale(locale)).recordingBySlug[file]?.title ?? 'Recording',
  }
}

// Compile the transcript body to HTML at build time (static export).
function bodyHtml(locale: Locale, slug: string): string {
  const md = readLocalizedMarkdown('recordings', locale, slug)
  return String(remark().use(remarkHtml).processSync(md))
}

export default async function RecordingTranscript({
  params,
}: {
  params: Promise<{ locale: string; group: string; file: string }>
}) {
  const { locale: rawLocale, group, file } = await params
  const locale = toLocale(rawLocale)
  const rec = getRecordings(locale).recordingBySlug[file]
  if (!rec || rec.groupingSlug !== group) notFound()

  const html = bodyHtml(locale, rec.slug)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Recordings', href: '/recordings' },
          { label: rec.grouping, href: `/recordings/${rec.groupingSlug}` },
          { label: rec.title },
        ]}
      />
      <PageHeading>{rec.title}</PageHeading>
      <RecordingPlayer
        src={recordingAudioUrl(rec.audioPath)}
        durationSeconds={rec.durationSeconds}
      />
      <TranscriptBody html={html} />
    </article>
  )
}
