import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DataList } from '@/components/DataList'
import { PageHeading } from '@/components/PageHeading'
import { PlayLink } from '@/components/PlayLink'
import { words } from '@/content/data'
import { downloadUrl } from '@/content/data/files'
import { expandWord } from '@/lib/hebrew'

export function generateStaticParams() {
  return words.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const word = words.find((w) => w.slug === slug)
  return { title: word?.name ?? 'Word of Power' }
}

export default async function WordOfPowerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const raw = words.find((w) => w.slug === slug)
  if (!raw) notFound()

  const word = expandWord(raw)

  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Words of Power', href: '/words-of-power' },
          { label: word.name },
        ]}
      />
      <div className="flex items-start justify-between gap-4">
        <PageHeading>{word.name}</PageHeading>
        <div className="flex shrink-0 items-center gap-2">
          {word.slug === 'ahih' && (
            <a
              href={downloadUrl('/files/ad-ahih.m4a')}
              className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              AD Recording
            </a>
          )}
          <PlayLink href={`/words-of-power/${word.slug}/play?autoplay=1`}>
            Practice ▶
          </PlayLink>
        </div>
      </div>

      {word.english && (
        <p className="text-zinc-600 dark:text-zinc-400">
          {word.english}
          {word.meaning && ` — ${word.meaning}`}
        </p>
      )}

      <DataList
        items={word.letters}
        getKey={(_, i) => String(i)}
        getHref={(_, i) => `/words-of-power/${word.slug}/play?idx=${i}`}
        player
        renderRow={(l) => (
          <>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {l.label}
              <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                {l.pronunciation}
              </span>
            </div>
            <div
              className="font-serif text-3xl leading-none text-zinc-900 dark:text-zinc-100"
              dir="rtl"
              lang="he"
            >
              {l.glyph}
            </div>
          </>
        )}
      />
    </article>
  )
}
