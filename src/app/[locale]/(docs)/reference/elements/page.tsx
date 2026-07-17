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
import { getElements, getGunas } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Elements'),
  }
}

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
            <TableHeader>Symbol</TableHeader>
            <TableHeader>Element</TableHeader>
            <TableHeader>Quality</TableHeader>
            <TableHeader>Principle</TableHeader>
            <TableHeader>Spirit</TableHeader>
            <TableHeader>Kerub</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {elements.map((e) => (
            <TableRow key={e.slug}>
              <TableCell>
                <ElementSymbol slug={e.slug} />
                <span className="sr-only">{e.name} symbol</span>
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {e.name}
              </TableCell>
              <TableCell>{e.quality}</TableCell>
              <TableCell>{e.relatingTo}</TableCell>
              <TableCell>{e.spirit}</TableCell>
              <TableCell>{e.kerub}</TableCell>
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
            <TableHeader>Symbol</TableHeader>
            <TableHeader>Guna</TableHeader>
            <TableHeader>Element</TableHeader>
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
                className="text-xl text-zinc-900 dark:text-white"
              >
                {g.glyph}
              </TableCell>
              <TableCell className="font-medium text-zinc-900 dark:text-white">
                {g.guna}
              </TableCell>
              <TableCell>{g.element}</TableCell>
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
