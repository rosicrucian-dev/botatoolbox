import { notFound } from 'next/navigation'

import {
  AstrologyFocusPlayer,
  type FocusItem,
} from '@/components/AstrologyFocusPlayer'
import { getAstrology } from '@/content/data'
import { t } from '@/content/messages'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { astrologySigns } = getAstrology(DEFAULT_LOCALE)

export function generateStaticParams() {
  return astrologySigns.map((s) => ({ slug: s.slug }))
}

export default async function SignFocusPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const { astrologySigns, signBySlug } = getAstrology(locale)
  const items: ReadonlyArray<FocusItem> = astrologySigns.map((s) => ({
    slug: s.slug,
    name: s.name,
    glyph: s.glyph,
    cardSlug: s.cardSlug,
    cardNum: s.cardNum,
    cardName: s.cardName,
    note: s.note,
    color: s.color,
  }))
  if (!signBySlug[slug]) notFound()
  return (
    <AstrologyFocusPlayer
      items={items}
      initialSlug={slug}
      title={t(locale, 'player.astrology.signsTitle')}
      kind="signs"
    />
  )
}
