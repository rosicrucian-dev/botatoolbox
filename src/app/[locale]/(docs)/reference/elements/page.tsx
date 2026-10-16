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
import { getElements, getGunas } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Elements')

// Both tables on this page lead with a Symbol column, and they read as a
// pair — so the column is pinned to one width in both rather than left to
// each table's own auto layout (which sized it off the widest cell, and so
// differently in a 2-column table than in a 7-column one). w-32 clears the
// "Symbol" header plus the gutter at every breakpoint, so neither table
// has to stretch past it; that is what keeps the second columns aligned.
const SYMBOL_COL = 'w-32'

// The classical element glyphs are derived from the slug rather than
// stored — an upward triangle (Fire), a downward triangle (Water), and
// their barred forms (Air, Earth). See content/data/README.md on the
// "symbols derived, never stored" convention.
function ElementSymbol({ slug }: { slug: string }) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6 text-zinc-900 dark:text-white"
    >
      {slug === 'fire' && <polygon points="12,3 21,20 3,20" {...stroke} />}
      {slug === 'water' && <polygon points="3,4 21,4 12,21" {...stroke} />}
      {slug === 'air' && (
        <>
          <polygon points="12,3 21,20 3,20" {...stroke} />
          <line x1="8.6" y1="14" x2="15.4" y2="14" {...stroke} />
        </>
      )}
      {slug === 'earth' && (
        <>
          <polygon points="3,4 21,4 12,21" {...stroke} />
          <line x1="8.6" y1="10" x2="15.4" y2="10" {...stroke} />
        </>
      )}
    </svg>
  )
}

export default async function ElementsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { elements } = getElements(locale)
  const { gunas } = getGunas(locale)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Elements' }]} />
      <PageHeading>Elements</PageHeading>

      <h2 className="text-2xl font-semibold tracking-tight dark:text-white">
        Four Elements
      </h2>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className={SYMBOL_COL}>Symbol</TableHeader>
            <TableHeader>Element</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {elements.map((e) => (
            <TableRow key={e.slug}>
              <TableCell className={SYMBOL_COL}>
                <ElementSymbol slug={e.slug} />
                <span className="sr-only">{e.name} symbol</span>
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {e.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="pt-4 text-2xl font-semibold tracking-tight dark:text-white">
        Three Gunas
      </h2>

      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            <TableHeader className={SYMBOL_COL}>Symbol</TableHeader>
            <TableHeader>Element</TableHeader>
            <TableHeader>Guna</TableHeader>
            <TableHeader>Alchemy</TableHeader>
            <TableHeader>Color</TableHeader>
            <TableHeader>Consciousness</TableHeader>
            <TableHeader>Principle</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {gunas.map((g) => (
            <TableRow key={g.slug}>
              <TableCell
                aria-label={`${g.alchemy} symbol`}
                className={`text-xl text-zinc-900 dark:text-white ${SYMBOL_COL}`}
              >
                {g.glyph}
              </TableCell>
              <TableCell>{g.element}</TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {g.guna}
              </TableCell>
              <TableCell>{g.alchemy}</TableCell>
              <TableCell>{g.color}</TableCell>
              <TableCell>{g.consciousness}</TableCell>
              <TableCell>{g.principle}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
