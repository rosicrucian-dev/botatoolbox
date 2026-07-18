import { cardByGlyph } from '@/lib/glyphCards'
import { toLocale } from '@/lib/locales'
import { GematriaPlayClient } from './GematriaPlayClient'

// Server shell: builds the glyph → card map at build time and hands it
// to the client player, so the datasets stay out of the bundle.
export default async function GematriaPlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return <GematriaPlayClient cardByGlyph={cardByGlyph(locale)} />
}
