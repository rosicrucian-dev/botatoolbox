import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { sephiroth, words } from '@/content/data'

export function generateStaticParams() {
  return sephiroth.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sephirah = sephiroth.find((s) => s.slug === slug)
  return { title: sephirah?.name ?? 'Sephirah' }
}

export default async function SephirahPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sephirah = sephiroth.find((s) => s.slug === slug)
  if (!sephirah) notFound()

  const mantra = sephirah.mantraSlug
    ? words.find((w) => w.slug === sephirah.mantraSlug)
    : null

  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        {sephirah.name}
      </h1>

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        <li>
          <div className="flex items-center justify-between gap-6 px-0 py-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Name
            </span>
            <span className="text-sm text-zinc-900 dark:text-zinc-100">
              {sephirah.hebrewName ?? '—'}
            </span>
          </div>
        </li>
        <li>
          <div className="flex items-center justify-between gap-6 px-0 py-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Grade
            </span>
            <span className="text-sm text-zinc-900 dark:text-zinc-100">
              {sephirah.grade ?? '—'}
            </span>
          </div>
        </li>
        <li>
          <div className="flex items-center justify-between gap-6 px-0 py-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Element
            </span>
            <span className="text-sm text-zinc-900 dark:text-zinc-100">
              {sephirah.element ?? '—'}
            </span>
          </div>
        </li>
        <li>
          {mantra ? (
            <Link
              href={`/words-of-power/${mantra.slug}`}
              className="-mx-2 flex items-center justify-between gap-6 rounded-sm px-2 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Mantra
              </span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {mantra.name}
                </span>
                <span aria-hidden className="text-zinc-400">
                  →
                </span>
              </span>
            </Link>
          ) : (
            <div className="flex items-center justify-between gap-6 px-0 py-4">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Mantra
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                —
              </span>
            </div>
          )}
        </li>
      </ul>
    </article>
  )
}
