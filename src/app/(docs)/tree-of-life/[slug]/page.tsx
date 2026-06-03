import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { DefinitionList, type DefinitionRow } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { sephiroth, sephirahBySlug, SEPHIROTH_DESCENT_SLUGS, words } from '@/content/data'

export function generateStaticParams() {
  return sephiroth.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sephirah = sephirahBySlug[slug]
  return { title: sephirah?.hebrewName ?? 'Sephirah' }
}

export default async function SephirahPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sephirah = sephirahBySlug[slug]
  if (!sephirah) notFound()

  const mantra = sephirah.mantraSlug
    ? words.find((w) => w.slug === sephirah.mantraSlug)
    : null

  // Prev/next in tree-descent order (Kether → Malkuth). No wrap-around:
  // Kether has no prev, Malkuth has no next.
  const descentIdx = SEPHIROTH_DESCENT_SLUGS.indexOf(slug as never)
  const prevSlug = descentIdx > 0 ? SEPHIROTH_DESCENT_SLUGS[descentIdx - 1] : null
  const nextSlug =
    descentIdx >= 0 && descentIdx < SEPHIROTH_DESCENT_SLUGS.length - 1
      ? SEPHIROTH_DESCENT_SLUGS[descentIdx + 1]
      : null
  const prev = prevSlug ? sephirahBySlug[prevSlug] : null
  const next = nextSlug ? sephirahBySlug[nextSlug] : null
  const prevHref = prev ? `/tree-of-life/${prev.slug}` : undefined
  const nextHref = next ? `/tree-of-life/${next.slug}` : undefined

  const rows: Array<DefinitionRow> = []
  rows.push({ label: 'English', value: sephirah.name })
  rows.push({
    label: 'Name of God',
    value: mantra ? (
      <Link
        href={`/words-of-power/${mantra.slug}`}
        className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
      >
        {mantra.name}
      </Link>
    ) : (
      '—'
    ),
  })
  if (sephirah.element) rows.push({ label: 'Element', value: sephirah.element })
  if (sephirah.briaticColors)
    rows.push({ label: 'Color', value: sephirah.briaticColors })
  if (sephirah.grade) rows.push({ label: 'Grade', value: sephirah.grade })

  return (
    <article className="space-y-6">
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        {sephirah.hebrewName}
      </h1>

      <DefinitionList rows={rows} />

      <nav
        aria-label="Sephirah navigation"
        className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800"
      >
        {prev ? (
          <Link
            href={`/tree-of-life/${prev.slug}`}
            className="group flex flex-col items-start gap-1 text-sm transition hover:text-zinc-600 dark:hover:text-zinc-400"
          >
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ← Previous
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {prev.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/tree-of-life/${next.slug}`}
            className="group flex flex-col items-end gap-1 text-sm transition hover:text-zinc-600 dark:hover:text-zinc-400"
          >
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Next →
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {next.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
