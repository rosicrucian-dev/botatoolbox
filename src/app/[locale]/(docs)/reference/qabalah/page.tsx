import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { getFourWorlds, getThreeVeils } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Qabalah')

export default async function QabalahPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { threeVeils } = getThreeVeils(locale)
  const { fourWorlds } = getFourWorlds(locale)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Qabalah' }]} />
      <PageHeading>Qabalah</PageHeading>

      <h2 className="text-2xl font-semibold tracking-tight dark:text-white">
        Three Veils
      </h2>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className="w-16">#</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Meaning</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {threeVeils.map((v) => (
            <TableRow key={v.num}>
              <TableCell className="w-16 text-zinc-500 tabular-nums dark:text-zinc-400">
                {v.num}
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {v.name}
              </TableCell>
              <TableCell className="whitespace-normal">{v.meaning}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="pt-4 text-2xl font-semibold tracking-tight dark:text-white">
        Four Worlds
      </h2>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className="w-16">#</TableHeader>
            <TableHeader>World</TableHeader>
            <TableHeader>Principle</TableHeader>
            <TableHeader>Element</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {fourWorlds.map((w, i) => (
            <TableRow key={w.slug}>
              <TableCell className="w-16 text-zinc-500 tabular-nums dark:text-zinc-400">
                {i + 1}
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {w.world}
              </TableCell>
              <TableCell>{w.principle}</TableCell>
              <TableCell>{w.element}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
