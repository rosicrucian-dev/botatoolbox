import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

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
  return { title: sephirah?.name ?? 'Sephirah' }
}

// One attribution row: label above, value below. Empty values render
// nothing so optional fields drop out cleanly.
function DataRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <li>
      <div className="flex flex-col gap-2 px-0 py-4">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        <span className="text-sm text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
      </div>
    </li>
  )
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

  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        {sephirah.name}
      </h1>

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        <DataRow label="Title" value={sephirah.hebrewName} />
        <li>
          <div className="flex flex-col gap-2 px-0 py-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Name of God
            </span>
            {mantra ? (
              <Link
                href={`/words-of-power/${mantra.slug}`}
                className="text-sm font-medium text-zinc-900 transition hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
              >
                {mantra.name}
              </Link>
            ) : (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                —
              </span>
            )}
          </div>
        </li>
        <DataRow label="Astrological Correspondence" value={sephirah.astrological} />
        <DataRow label="Tarot Correspondence" value={sephirah.tarotMinors} />
        <DataRow label="Elemental Correspondence" value={sephirah.element} />
        <DataRow label="Magical Image" value={sephirah.magicalImage} />
        <DataRow label="Additional Symbols" value={sephirah.symbols} />
        <DataRow label="Colors" value={sephirah.briaticColors} />
        <DataRow label="Correspondence in the Microcosm" value={sephirah.microcosm} />
        <DataRow
          label="Correspondence in the Body"
          value={sephirah.bodyCorrespondence}
        />
        <DataRow label="Grade of Initiation:" value={sephirah.grade} />
      </ul>

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
