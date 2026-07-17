import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { IndexLabel } from '@/components/IndexLabel'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import { getBookOfTokens } from '@/content/texts/book-of-tokens'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { chapters } = getBookOfTokens(DEFAULT_LOCALE)

export function generateStaticParams() {
  return chapters.map((c) => ({ chapter: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; chapter: string }>
}): Promise<Metadata> {
  const { locale: rawLocale, chapter } = await params
  const c = getBookOfTokens(toLocale(rawLocale)).chapterBySlug[chapter]
  return { title: c ? `${c.title} — The Book of Tokens` : 'The Book of Tokens' }
}

// One meditation. Each verse is its number in the left margin (IndexLabel, as
// the Trestleboard uses) beside its stanzas; unnumbered chapters (Malkuth)
// render as continuous verse.
export default async function Chapter({
  params,
}: {
  params: Promise<{ locale: string; chapter: string }>
}) {
  const { locale: rawLocale, chapter } = await params
  const { chapters, chapterBySlug } = getBookOfTokens(toLocale(rawLocale))
  const c = chapterBySlug[chapter]
  if (!c) notFound()

  const idx = chapters.findIndex((x) => x.slug === c.slug)
  const prev = chapters[idx - 1]
  const next = chapters[idx + 1]
  const prevHref = prev ? `/texts/book-of-tokens/${prev.slug}` : undefined
  const nextHref = next ? `/texts/book-of-tokens/${next.slug}` : undefined

  return (
    <article className="space-y-8">
      <SetBreadcrumbs
        items={[
          { label: 'The Book of Tokens', href: '/texts/book-of-tokens' },
          { label: c.title },
        ]}
      />
      <KeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <PageHeading>{c.title}</PageHeading>

      <ol className="space-y-6">
        {c.verses.map((v, vi) => (
          <li key={vi} className="flex items-baseline gap-3 md:gap-4">
            {v.label ? <IndexLabel>{v.label}</IndexLabel> : null}
            <div className="max-w-prose space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
              {v.stanzas.map((stanza, si) => (
                <p key={si}>
                  {stanza.map((line, li) => (
                    <span key={li} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <PrevNextNav
        ariaLabel="Meditation navigation"
        prev={prev ? { href: prevHref!, label: prev.title } : undefined}
        next={next ? { href: nextHref!, label: next.title } : undefined}
      />
    </article>
  )
}
