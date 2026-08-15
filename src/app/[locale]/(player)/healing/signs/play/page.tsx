import { getSigns, getTarot } from '@/content/data'
import { getLetterMeta } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import { SignsPlayClient, type SignSlideData } from './SignsPlayClient'

// Server shell: joins each sign with its tarot card at build time and
// hands the slide data to the client player.
export default async function SignsPlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  const { signs } = getSigns(locale)
  const { cardByLetter } = getTarot(locale)
  const slides: Array<SignSlideData> = signs.map((s) => {
    const card = cardByLetter[s.letter]
    return {
      label: s.name,
      bodyPart: s.bodyPart,
      glyph: getLetterMeta(s.letter).glyph,
      note: card?.note,
      color: card?.color,
      cardNum: card?.num,
      cardSlug: card?.slug,
      cardName: card?.name,
    }
  })
  return <SignsPlayClient signs={slides} />
}
