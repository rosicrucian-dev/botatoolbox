import { getTarot } from '@/content/data'
import { getLetterMeta } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import {
  MajorArcanaPlayClient,
  type MajorArcanaSlideCard,
} from './MajorArcanaPlayClient'

// Server shell: joins each card with its letter glyph at build time and
// hands the slide data to the client player.
export default async function MajorArcanaPlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { cards } = getTarot(toLocale((await params).locale))
  const slides: Array<MajorArcanaSlideCard> = cards.map((c) => ({
    num: c.num,
    slug: c.slug,
    label: c.name,
    glyph: getLetterMeta(c.letter).glyph,
    cardName: c.name,
    note: c.note,
    color: c.color,
  }))
  return <MajorArcanaPlayClient cards={slides} />
}
