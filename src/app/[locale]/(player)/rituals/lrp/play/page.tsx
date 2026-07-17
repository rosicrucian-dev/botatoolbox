import { parseRitual } from '@/content/data/rituals'
import { readLocalizedMarkdown } from '@/content/markdown'
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
  const { locale: rawLocale } = await params
  const md = readLocalizedMarkdown('rituals', toLocale(rawLocale), 'lrp')
  return <LrpPlayer sections={parseRitual(md)} />
}
