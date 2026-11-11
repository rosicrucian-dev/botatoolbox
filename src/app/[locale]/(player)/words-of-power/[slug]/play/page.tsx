import { notFound } from 'next/navigation'

import { getTarot, getWords } from '@/content/data'
import { expandWord } from '@/lib/hebrew'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'
import { WordOfPowerPlayer } from './WordPlayer'

// Structural (slug) enumeration — English source on purpose.
const { words } = getWords(DEFAULT_LOCALE)

export function generateStaticParams() {
  return words.map((w) => ({ slug: w.slug }))
}

export default async function WordOfPowerPlayPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const raw = getWords(locale).wordBySlug[slug]
  if (!raw) notFound()

  return (
    <WordOfPowerPlayer word={expandWord(raw, getTarot(locale).cardByLetter)} />
  )
}
