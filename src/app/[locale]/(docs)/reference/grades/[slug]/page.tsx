import { Link } from '@/components/LocaleLink'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { MajorImage } from '@/components/CardImage'
import { DefinitionList, type DefinitionRow } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import { TextLink } from '@/components/TextLink'
import {
  getGrades,
  getSephiroth,
  getTarot,
  type TarotCard,
} from '@/content/data'
import { romanToLetters } from '@/lib/hebrew'
import { DEFAULT_LOCALE, toLocale, type Locale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { grades } = getGrades(DEFAULT_LOCALE)

export function generateStaticParams() {
  return grades.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  const grade = getGrades(toLocale(rawLocale)).grades.find(
    (g) => g.slug === slug,
  )
  return { title: grade ? grade.name : 'Grade' }
}

// Strip of tarot key thumbnails (one per Hebrew letter) under a small
// subtitle. flex-1 squeezes them evenly across the article width.
function KeyStrip({
  locale,
  subtitle,
  letters,
}: {
  locale: Locale
  subtitle: string
  letters: ReadonlyArray<string>
}) {
  const { cardByLetter } = getTarot(locale)
  const keys = letters
    .map((l) => cardByLetter[l])
    .filter((c): c is TarotCard => Boolean(c))
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
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const { grades } = getGrades(locale)
  const { sephirahBySlug } = getSephiroth(locale)
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
      <SetBreadcrumbs
        items={[
          { label: 'Grades', href: '/reference/grades' },
          { label: grade.name },
        ]}
      />
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <PageHeading>{grade.name}</PageHeading>

      <DefinitionList rows={rows} />

      {seph?.hebrewRoman && (
        <KeyStrip
          locale={locale}
          subtitle={seph.name}
          letters={romanToLetters(seph.hebrewRoman)}
        />
      )}
      {grade.intelligenceName && grade.intelligenceRoman && (
        <KeyStrip
          locale={locale}
          subtitle={grade.intelligenceName}
          letters={romanToLetters(grade.intelligenceRoman)}
        />
      )}

      <PrevNextNav
        ariaLabel="Grade navigation"
        prev={
          prev
            ? { href: `/reference/grades/${prev.slug}`, label: prev.name }
            : undefined
        }
        next={
          next
            ? { href: `/reference/grades/${next.slug}`, label: next.name }
            : undefined
        }
      />
    </article>
  )
}
