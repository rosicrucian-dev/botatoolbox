import { getTarot, getWords } from '@/content/data'
import { parseRitual } from '@/content/data/rituals'
import { readLocalizedMarkdown } from '@/content/markdown'
import { expandWord, type ExpandedWord } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import { LrpPlayer } from './LrpPlayer'

// Server wrapper: parse the ritual markdown at build and hand the plain
// section data across the RSC boundary. The choreography (slides, angel
// visualizations, chant timing) lives in the client component.

export default async function LesserPentagramPlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  const md = readLocalizedMarkdown('rituals', locale, 'lrp')
  const { cardByLetter } = getTarot(locale)
  const expandedBySlug: Record<string, ExpandedWord> = Object.fromEntries(
    getWords(locale).words.map((w) => [w.slug, expandWord(w, cardByLetter)]),
  )
  return <LrpPlayer sections={parseRitual(md)} expandedBySlug={expandedBySlug} />
}
