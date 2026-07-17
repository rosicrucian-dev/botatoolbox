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
import { TextLink } from '@/components/TextLink'
import { getAstrology, getChakras } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Chakras'),
  }
}

export default async function ChakrasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { chakras } = getChakras(locale)
  const { planetBySlug } = getAstrology(locale)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Chakras' }]} />
      <PageHeading>Chakras</PageHeading>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader>Planet</TableHeader>
            <TableHeader>Metal</TableHeader>
            <TableHeader>Chakra</TableHeader>
            <TableHeader>Church</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Displayed crown → root (Mercury at top, Saturn at bottom).
              The `chakras` data stays in its documented root → crown order,
              so reverse a copy here rather than mutating the source. */}
          {[...chakras].reverse().map((c) => {
            const planet = planetBySlug[c.planet]
            return (
              <TableRow key={c.planet}>
                <TableCell>
                  {planet ? (
                    <TextLink
                      href={`/reference/astrology/planets/${planet.slug}`}
                      className="font-medium"
                    >
                      {planet.name}
                    </TextLink>
                  ) : (
                    c.planet
                  )}
                </TableCell>
                <TableCell>{c.metal}</TableCell>
                <TableCell>{c.chakra}</TableCell>
                <TableCell>{c.church}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </article>
  )
}
