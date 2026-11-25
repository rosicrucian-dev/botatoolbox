import { MovedTo } from '@/components/nav/MovedTo'
import { getAstrology } from '@/content/data'
import { DEFAULT_LOCALE } from '@/lib/locales'

// The Astrology page became Signs, Planets and Houses (10 November
// 2026), and a detail page is the likeliest thing to be bookmarked, so
// each keeps its stub.

export function generateStaticParams() {
  return getAstrology(DEFAULT_LOCALE).astrologySigns.map((s) => ({
    slug: s.slug,
  }))
}

export default async function SignRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <MovedTo to={`/correspondences/signs/${slug}`} what="This sign" />
}
