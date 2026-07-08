import { type Metadata } from 'next'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { fourWorlds, pillars, tenPalaces, threeVeils } from '@/content/data'

export const metadata: Metadata = {
  title: 'Qabalah',
}

export default function QabalahPage() {
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
              <TableCell className="w-16 tabular-nums text-zinc-500 dark:text-zinc-400">
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
            <TableHeader>Beings</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {fourWorlds.map((w, i) => (
            <TableRow key={w.slug}>
              <TableCell className="w-16 tabular-nums text-zinc-500 dark:text-zinc-400">
                {i + 1}
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {w.world}
              </TableCell>
              <TableCell>{w.principle}</TableCell>
              <TableCell className="whitespace-normal">{w.beings}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="pt-4 text-2xl font-semibold tracking-tight dark:text-white">
        Ten Palaces of Assiah
      </h2>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className="w-16">#</TableHeader>
            <TableHeader>Sphere</TableHeader>
            <TableHeader>Name</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {tenPalaces.map((p) => (
            <TableRow key={p.num}>
              <TableCell className="w-16 tabular-nums text-zinc-500 dark:text-zinc-400">
                {p.num}
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {p.sphere}
              </TableCell>
              <TableCell>{p.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="pt-4 text-2xl font-semibold tracking-tight dark:text-white">
        Pillars
      </h2>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className="w-1/2">Severity</TableHeader>
            <TableHeader className="w-1/2">Mercy</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {pillars.map(([passive, active], i) => (
            <TableRow key={i}>
              <TableCell className="w-1/2 whitespace-normal">{passive}</TableCell>
              <TableCell className="w-1/2 whitespace-normal">{active}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
