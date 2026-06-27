import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { words } from '@/content/data'
import { expandWord } from '@/lib/hebrew'
import { PlayLink } from '@/components/PlayLink'

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          {word.name}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          {word.slug === 'ahih' && (
            <a
              href="/files/ad-ahih.m4a"
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

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {word.letters.map(
          (
            l: { label: string; pronunciation: string; glyph: string },
            i: number,
          ) => (
            <li key={i}>
              <PlayLink
                href={`/words-of-power/${word.slug}/play?idx=${i}`}
                className="-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
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
              </PlayLink>
            </li>
          ),
        )}
      </ul>
    </article>
  )
}
