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
import { getGrades, getSephiroth } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Grades'),
  }
}

function Dash() {
  return <span className="text-zinc-400 dark:text-zinc-600">—</span>
}

export default async function GradesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { grades } = getGrades(locale)
  const { sephirahBySlug } = getSephiroth(locale)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Grades' }]} />
      <PageHeading>Grades</PageHeading>
      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader>Grade</TableHeader>
            <TableHeader>Number</TableHeader>
            <TableHeader>Sephirah</TableHeader>
            <TableHeader>Intelligence</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {grades.map((g) => {
            const sephirah = g.sephirah ? sephirahBySlug[g.sephirah] : null
            return (
              <TableRow
                key={g.slug}
                href={`/reference/grades/${g.slug}`}
                title={g.name}
              >
                <TableCell className="font-medium text-zinc-900 dark:text-white">
                  {g.name}
                </TableCell>
                <TableCell className="text-zinc-500 tabular-nums dark:text-zinc-400">
                  {g.gradeNumber}
                </TableCell>
                <TableCell>{sephirah ? sephirah.name : <Dash />}</TableCell>
                <TableCell>{g.intelligenceName ?? <Dash />}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </article>
  )
}
