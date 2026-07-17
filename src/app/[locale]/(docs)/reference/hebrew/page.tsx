import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import { PageHeading } from '@/components/PageHeading'
import { getTarot } from '@/content/data'
import { letters } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Hebrew'),
  }
}

export default async function Hebrew({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { cards } = getTarot(toLocale(rawLocale))
  // The 22 letters in alphabetical order. Each major-arcana trump maps to one
  // letter (cards 0–21 == Aleph–Tav), so the card data already carries the
  // letter name, its significance/meaning, and its gematria value; the glyph
  // comes from the letters table in lib/hebrew.
  const alphabet = [...cards].sort((a, b) => a.num - b.num)
  return (
    <article className="space-y-8">
      <SetBreadcrumbs items={[{ label: 'Hebrew' }]} />
      <PageHeading>Hebrew</PageHeading>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader>Letter</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Meaning</TableHeader>
            <TableHeader className="text-right">Value</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {alphabet.map((card) => (
            <TableRow key={card.letter} title={card.letter}>
              <TableCell className="text-2xl leading-none">
                {letters[card.letter]?.glyph}
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {card.letter}
              </TableCell>
              <TableCell>{card.significance}</TableCell>
              <TableCell className="text-right tabular-nums">
                {card.gematria}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
