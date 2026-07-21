import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { type ReactNode } from 'react'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { HighlightMatches } from '@/components/HighlightMatches'
import { IndexLabel } from '@/components/IndexLabel'
import { KeyboardNav } from '@/components/KeyboardNav'
import { Link } from '@/components/LocaleLink'
import { PageHeading } from '@/components/PageHeading'
import { PrevNextNav } from '@/components/PrevNextNav'
import { getTarot } from '@/content/data/tarot'
import { getBookOfTokens } from '@/content/texts/book-of-tokens'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { chapters } = getBookOfTokens(DEFAULT_LOCALE)

// Render the source's Markdown emphasis (`*Ruach*`, `**Atah**`) as italics.
// Comment prose keeps these markers (poetry strips them); nothing else in the
// text uses `*`, so a split on balanced runs is enough — no full MD parser.
function renderEmphasis(text: string): ReactNode {
  return text.split(/(\*{1,2}[^*]+\*{1,2})/g).map((part, i) => {
    const m = part.match(/^(\*{1,2})([^*]+)\1$/)
    return m ? <em key={i}>{m[2]}</em> : part
  })
}

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
  const locale = toLocale(rawLocale)
  const { chapters, chapterBySlug } = getBookOfTokens(locale)
  const c = chapterBySlug[chapter]
  if (!c) notFound()

  // The Major Arcana card attributed to this letter. Slugs are always the
  // English letter name lowercased, so capitalizing keys cardByLetter directly;
  // Prologos and Malkuth aren't letters, so there's no card.
  const letterName = c.slug.charAt(0).toUpperCase() + c.slug.slice(1)
  const card = getTarot(locale).cardByLetter[letterName]

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
      <div>
        <PageHeading>{c.title}</PageHeading>
        {card ? (
          <Link
            href={`/tarot/${card.slug}`}
            className="mt-1 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            {card.name}
          </Link>
        ) : null}
      </div>

      {/* key={c.slug} forces a fresh mount per chapter: useHighlightQuery
          mutates this (React-owned) DOM to inject <mark>s, and chapter-to-
          chapter nav is client-side (reconciled in place), so without a remount
          React would diff the previous chapter's mutated tree into the next —
          risking stale marks or a removeChild error. Remounting sidesteps that. */}
      <HighlightMatches key={c.slug} dep={c.slug} className="space-y-10">
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

        {c.comment.length > 0 ? (
          <section className="space-y-6 border-t border-zinc-900/5 pt-8 dark:border-white/5">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Comment on {c.title}
            </h2>
            {/* Verse-keyed notes: same margin-number layout as the meditation
                above, but prose paragraphs (stanza lines joined) with the
                source's emphasis rendered as italics. */}
            <ol className="space-y-6">
              {c.comment.map((note, ni) => (
                <li key={ni} className="flex items-baseline gap-3 md:gap-4">
                  {note.label ? <IndexLabel>{note.label}</IndexLabel> : null}
                  <div className="max-w-prose space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {note.stanzas.map((stanza, si) => (
                      <p key={si}>{renderEmphasis(stanza.join(' '))}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </HighlightMatches>

      <PrevNextNav
        ariaLabel="Meditation navigation"
        prev={prev ? { href: prevHref!, label: prev.title } : undefined}
        next={next ? { href: nextHref!, label: next.title } : undefined}
      />
    </article>
  )
}
