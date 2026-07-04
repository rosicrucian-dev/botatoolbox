import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { PageHeading } from '@/components/PageHeading'
import { Prose } from '@/components/Prose'
import { textBySlug, texts } from '@/content/data'

// Generic renderer for the prose texts. A new text is a content/texts/<slug>.md
// file plus one line in content/data/texts.json — no code. Texts flagged
// `custom` (their own bespoke route, e.g. the Trestleboard) are excluded.

export function generateStaticParams() {
  return texts.filter((t) => !t.custom).map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: textBySlug[slug]?.title ?? 'Text' }
}

// Compile the markdown body to HTML at build time (static export). Read
// from disk by slug so adding a text needs no per-file import.
function bodyHtml(slug: string): string {
  const path = join(process.cwd(), 'content/texts', `${slug}.md`)
  let md: string
  try {
    md = readFileSync(path, 'utf8')
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
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const text = textBySlug[slug]
  if (!text || text.custom) notFound()

  const html = bodyHtml(slug)
  return (
    <article className="space-y-6">
      <PageHeading>{text.title}</PageHeading>
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Prose>
    </article>
  )
}
