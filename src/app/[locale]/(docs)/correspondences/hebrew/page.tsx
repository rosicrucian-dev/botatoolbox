import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { TextLink } from '@/components/ui/TextLink'
import { getTarot } from '@/content/data'
import { letters } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Hebrew')

// The 22 letters in alphabetical order. Each major-arcana trump maps to
// one letter (cards 0-21 == Aleph-Tav), so the card data already
// carries the letter name, its transliteration, its significance and
// its gematria; the glyph comes from the letters table in lib/hebrew.
//
// TYPE is the Sepher Yetzirah's division: three Mothers, seven Doubles,
// twelve Singles. It is derived from the name rather than stored,
// because the division is fixed and naming it in the data would be a
// second place for it to be wrong.
function letterType(letter: string): 'Mother' | 'Double' | 'Single' {
  if (['Aleph', 'Mem', 'Shin'].includes(letter)) return 'Mother'
  if (
    ['Beth', 'Gimel', 'Daleth', 'Kaph', 'Peh', 'Resh', 'Tav'].includes(letter)
  )
    return 'Double'
  return 'Single'
}

export default async function Hebrew({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { cards } = getTarot(toLocale(rawLocale))
  const alphabet = [...cards].sort((a, b) => a.num - b.num)
  return (
    <article className="space-y-8">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Hebrew' },
        ]}
      />
      <PageHeading>Hebrew</PageHeading>
      <DataTable
        head={[
          'Letter',
          'Name',
          'Transliteration',
          'Meaning',
          'Value',
          'Type',
          'Key',
        ]}
        rows={alphabet.map((card) => [
          <span key="glyph" className="text-2xl leading-none">
            {letters[card.letter]?.glyph}
          </span>,
          card.letter,
          card.english,
          card.significance,
          <span key="value" className="tabular-nums">
            {card.gematria}
          </span>,
          letterType(card.letter),
          <TextLink key="key" href={`/tarot/${card.slug}`}>
            {card.num}. {card.name}
          </TextLink>,
        ])}
      />
    </article>
  )
}
