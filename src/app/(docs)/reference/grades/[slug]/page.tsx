import { type Metadata } from 'next'
import { Link } from 'next-view-transitions'
import { notFound } from 'next/navigation'

import { MajorImage } from '@/components/CardImage'
import { DefinitionList, type DefinitionRow } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import { TextLink } from '@/components/TextLink'
import { cardByLetter, cards, grades, sephirahBySlug } from '@/content/data'
import { romanToLetters } from '@/lib/hebrew'

export function generateStaticParams() {
  return grades.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const grade = grades.find((g) => g.slug === slug)
  return { title: grade ? grade.name : 'Grade' }
}

// Strip of tarot key thumbnails (one per Hebrew letter) under a small
// subtitle. flex-1 squeezes them evenly across the article width.
function KeyStrip({
  subtitle,
  letters,
}: {
  subtitle: string
  letters: ReadonlyArray<string>
}) {
  const keys = letters
    .map((l) => cardByLetter[l])
    .filter((c): c is (typeof cards)[number] => Boolean(c))
  if (keys.length === 0) return null
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight dark:text-white">
        {subtitle}
      </h2>
      <div className="flex gap-2">
        {keys.map((card, idx) => (
          <Link
            key={`${card.slug}-${idx}`}
            href={`/tarot/${card.slug}`}
            className="block flex-1 transition hover:-translate-y-0.5 hover:opacity-90"
            aria-label={`${card.num}. ${card.name}`}
            title={`${card.num}. ${card.name}`}
          >
            <MajorImage
              card={card}
              thumb
              alt={`${card.num}. ${card.name}`}
              width={362}
              height={600}
              loading="lazy"
              className="w-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function GradePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const i = grades.findIndex((g) => g.slug === slug)
  if (i === -1) notFound()
  const grade = grades[i]
  const prev = i > 0 ? grades[i - 1] : undefined
  const next = i < grades.length - 1 ? grades[i + 1] : undefined
  const prevHref = prev ? `/reference/grades/${prev.slug}` : undefined
  const nextHref = next ? `/reference/grades/${next.slug}` : undefined

  const seph = grade.sephirah ? sephirahBySlug[grade.sephirah] : null

  // Row order: Sephirah → Intelligence → Grade. Sephirah/Intelligence
  // share the "<english>, <hebrew> (<roman>)" format below.
  const rows: Array<DefinitionRow> = []
  if (seph) {
    rows.push({
      label: 'Sephirah',
      value: (
        <TextLink href={`/tree-of-life/${seph.slug}`}>
          {seph.name}, <em className="italic">{seph.hebrewName}</em>
          {seph.hebrewRoman && (
            <span className="ml-1 text-zinc-500 dark:text-zinc-400">
              ({seph.hebrewRoman})
            </span>
          )}
        </TextLink>
      ),
    })
  }
  if (grade.intelligenceName) {
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
  rows.push({ label: 'Grade', value: grade.gradeNumber })

  return (
    <article className="space-y-6">
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <PageHeading>{grade.name}</PageHeading>

      <DefinitionList rows={rows} />

      {seph?.hebrewRoman && (
        <KeyStrip
          subtitle={seph.name}
          letters={romanToLetters(seph.hebrewRoman)}
        />
      )}
      {grade.intelligenceName && grade.intelligenceRoman && (
        <KeyStrip
          subtitle={grade.intelligenceName}
          letters={romanToLetters(grade.intelligenceRoman)}
        />
      )}

      <PrevNextNav
        ariaLabel="Grade navigation"
        prev={
          prev ? { href: `/reference/grades/${prev.slug}`, label: prev.name } : undefined
        }
        next={
          next ? { href: `/reference/grades/${next.slug}`, label: next.name } : undefined
        }
      />
    </article>
  )
}
