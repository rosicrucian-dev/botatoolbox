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
import { getNumerology } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Numerology'),
  }
}

export default async function NumerologyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { numerology } = getNumerology(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Numerology' }]} />
      <PageHeading>Numerology</PageHeading>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className="w-20">Number</TableHeader>
            <TableHeader>Meaning</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {numerology.map((n) => (
            <TableRow key={n.num}>
              <TableCell className="w-20 font-medium text-zinc-900 tabular-nums dark:text-white">
                {n.num}
              </TableCell>
              <TableCell className="whitespace-normal">{n.meaning}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
