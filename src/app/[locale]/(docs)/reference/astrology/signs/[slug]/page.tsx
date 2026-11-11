import { MovedTo } from '@/components/nav/MovedTo'
import { getAstrology } from '@/content/data'
import { DEFAULT_LOCALE } from '@/lib/locales'

// A REGROUPING, NOT A RENAME (November 2026): the tables moved behind
// /correspondences, their own index, when the Reference became the five
// things a reader looks up (src/lib/tables.ts). A detail page is the
// likeliest thing to be bookmarked or linked to, so each one keeps its
// stub — a server page, because the redirect is per slug and the export
// needs the list to write the files.

export function generateStaticParams() {
  return getAstrology(DEFAULT_LOCALE).astrologySigns.map((s) => ({ slug: s.slug }))
}

export default async function SignRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <MovedTo to={`/correspondences/astrology/signs/${slug}`} what="This sign" />
}
