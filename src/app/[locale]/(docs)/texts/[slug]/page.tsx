import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { Prose } from '@/components/Prose'
import { getTexts } from '@/content/data'
import { readLocalizedMarkdown } from '@/content/markdown'
import { DEFAULT_LOCALE, toLocale, type Locale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { texts } = getTexts(DEFAULT_LOCALE)

// Generic renderer for the prose texts. A new text is a content/texts/<slug>.md
// file plus one line in content/data/texts.json — no code. Texts flagged
// `custom` (their own bespoke route, e.g. the Trestleboard) are excluded.

export function generateStaticParams() {
  return texts.filter((t) => !t.custom).map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  const { textBySlug } = getTexts(toLocale(rawLocale))
  return { title: textBySlug[slug]?.title ?? 'Text' }
}

// Compile the markdown body to HTML at build time (static export). Read
// from disk by slug so adding a text needs no per-file import; a missing
// translation falls back to the English file (readLocalizedMarkdown).
function bodyHtml(locale: Locale, slug: string): string {
  let md: string
  try {
    md = readLocalizedMarkdown('texts', locale, slug)
  } catch {
    throw new Error(
      `texts.json lists "${slug}" but content/texts/${slug}.md is missing`,
    )
  }
  return String(remark().use(remarkHtml).processSync(md))
}

export default async function TextPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const text = getTexts(locale).textBySlug[slug]
  if (!text || text.custom) notFound()

  const html = bodyHtml(locale, slug)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: text.title }]} />
      <PageHeading>{text.title}</PageHeading>
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Prose>
    </article>
  )
}
