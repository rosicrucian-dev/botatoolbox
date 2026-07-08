import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DefinitionList, type DefinitionRow } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import { TextLink } from '@/components/TextLink'
import {
  gradeBySephirahSlug,
  sephirahBySlug,
  sephiroth,
  SEPHIROTH_DESCENT_SLUGS,
  words,
} from '@/content/data'

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
  const prevSlug =
    descentIdx > 0 ? SEPHIROTH_DESCENT_SLUGS[descentIdx - 1] : null
  const nextSlug =
    descentIdx >= 0 && descentIdx < SEPHIROTH_DESCENT_SLUGS.length - 1
      ? SEPHIROTH_DESCENT_SLUGS[descentIdx + 1]
      : null
  const prev = prevSlug ? sephirahBySlug[prevSlug] : null
  const next = nextSlug ? sephirahBySlug[nextSlug] : null
  const prevHref = prev ? `/tree-of-life/${prev.slug}` : undefined
  const nextHref = next ? `/tree-of-life/${next.slug}` : undefined

  const grade = gradeBySephirahSlug[sephirah.slug]

  // Row order: Name → Intelligence → Grade → Name of God → Element → Color.
  // Name + Intelligence reuse the same `<english>, <hebrew> (<roman>)`
  // formatting as the Grade detail page.
  const rows: Array<DefinitionRow> = []
  rows.push({
    label: 'Name',
    value: (
      <span>
        {sephirah.name}, <em className="italic">{sephirah.hebrewName}</em>
        {sephirah.hebrewRoman && (
          <span className="ml-1 text-zinc-500 dark:text-zinc-400">
            ({sephirah.hebrewRoman})
          </span>
        )}
      </span>
    ),
  })
  if (grade?.intelligenceName) {
    rows.push({
      label: 'Intelligence',
      value: (
        <span>
          {grade.intelligenceName}
          {grade.intelligenceHebrew && (
            <>
              , <em className="italic">{grade.intelligenceHebrew}</em>
            </>
          )}
          {grade.intelligenceRoman && (
            <span className="ml-1 text-zinc-500 dark:text-zinc-400">
              ({grade.intelligenceRoman})
            </span>
          )}
        </span>
      ),
    })
  }
  if (grade) {
    rows.push({
      label: 'Grade',
      value: (
        <TextLink href={`/reference/grades/${grade.slug}`}>
          {grade.name} {grade.gradeNumber}
        </TextLink>
      ),
    })
  }
  rows.push({
    label: 'Name of God',
    value: mantra ? (
      <TextLink href={`/words-of-power/${mantra.slug}`}>{mantra.name}</TextLink>
    ) : (
      '—'
    ),
  })
  if (sephirah.element) rows.push({ label: 'Element', value: sephirah.element })
  if (sephirah.briaticColors)
    rows.push({ label: 'Color', value: sephirah.briaticColors })

  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Tree of Life', href: '/tree-of-life' },
          { label: sephirah.hebrewName },
        ]}
      />
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <PageHeading>{sephirah.hebrewName}</PageHeading>

      <DefinitionList rows={rows} />

      <PrevNextNav
        ariaLabel="Sephirah navigation"
        prev={
          prev
            ? { href: `/tree-of-life/${prev.slug}`, label: prev.name }
            : undefined
        }
        next={
          next
            ? { href: `/tree-of-life/${next.slug}`, label: next.name }
            : undefined
        }
      />
    </article>
  )
}
