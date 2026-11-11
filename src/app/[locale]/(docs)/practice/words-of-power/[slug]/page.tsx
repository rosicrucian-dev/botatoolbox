import { MovedTo } from '@/components/nav/MovedTo'
import { getWords } from '@/content/data'
import { DEFAULT_LOCALE } from '@/lib/locales'

// One stub per word: these are the addresses the school site links to
// from its Sephiroth pages and its practice texts, so they are the ones
// most likely to be followed from outside.
export function generateStaticParams() {
  return getWords(DEFAULT_LOCALE).words.map((w) => ({ slug: w.slug }))
}

export default async function WordRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <MovedTo to={`/words-of-power/${slug}`} what="This word of power" />
}
