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
import { getAstrology, getHouses } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Astrology'),
  }
}

// Ordinal label for a house number: 1 → "1st", 2 → "2nd", 11 → "11th".
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

function Dash() {
  return <span className="text-zinc-400 dark:text-zinc-600">—</span>
}

// A comma-separated list of cross-links (rulers, exaltation). Each link
// is positioned `relative` so it sits above the clickable-row overlay
// and stays independently clickable.
function LinkList({
  items,
  hrefBase,
}: {
  items: Array<{ slug: string; name: string }>
  hrefBase: string
}) {
  if (items.length === 0) return <Dash />
  return (
    <>
      {items.map((item, i) => (
        <span key={item.slug}>
          <TextLink href={`${hrefBase}/${item.slug}`} className="relative">
            {item.name}
          </TextLink>
          {i < items.length - 1 ? ', ' : null}
        </span>
      ))}
    </>
  )
}

export default async function Astrology({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const {
    astrologyPlanets: planets,
    astrologySigns: signs,
    planetBySlug,
    signBySlug,
  } = getAstrology(locale)
  const { houses } = getHouses(locale)
  return (
    <article className="space-y-8">
      <SetBreadcrumbs items={[{ label: 'Astrology' }]} />
      <PageHeading>Astrology</PageHeading>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Planets
        </h2>
        <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
          <TableHead>
            <TableRow>
              <TableHeader>Planet</TableHeader>
              <TableHeader>Symbol</TableHeader>
              <TableHeader>Ruler</TableHeader>
              <TableHeader>Exaltation</TableHeader>
              <TableHeader>Alchemy</TableHeader>
              <TableHeader>Color</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {planets.map((p) => {
              const rules = p.rules
                .map((s) => signBySlug[s])
                .filter((s): s is NonNullable<typeof s> => Boolean(s))
              const exalts = p.exaltedIn ? signBySlug[p.exaltedIn] : null
              return (
                <TableRow
                  key={p.slug}
                  href={`/reference/astrology/planets/${p.slug}`}
                  title={p.name}
                >
                  <TableCell className="font-medium text-zinc-900 dark:text-white">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-xl leading-none">
                    {p.glyph}
                  </TableCell>
                  <TableCell>
                    <LinkList
                      items={rules}
                      hrefBase="/reference/astrology/signs"
                    />
                  </TableCell>
                  <TableCell>
                    {exalts ? (
                      <LinkList
                        items={[exalts]}
                        hrefBase="/reference/astrology/signs"
                      />
                    ) : (
                      <Dash />
                    )}
                  </TableCell>
                  <TableCell>{p.alchemy}</TableCell>
                  <TableCell>{p.color}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Signs
        </h2>
        <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
          <TableHead>
            <TableRow>
              <TableHeader>Sign</TableHeader>
              <TableHeader>Symbol</TableHeader>
              <TableHeader>Ruler</TableHeader>
              <TableHeader>Exaltation</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Body</TableHeader>
              <TableHeader>Quality</TableHeader>
              <TableHeader>Alchemy</TableHeader>
              <TableHeader>Color</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {signs.map((s) => {
              const rulers = s.rulers
                .map((p) => planetBySlug[p])
                .filter((p): p is NonNullable<typeof p> => Boolean(p))
              const exalts = s.exaltedBy ? planetBySlug[s.exaltedBy] : null
              return (
                <TableRow
                  key={s.slug}
                  href={`/reference/astrology/signs/${s.slug}`}
                  title={s.name}
                >
                  <TableCell className="font-medium text-zinc-900 dark:text-white">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-xl leading-none">
                    {s.glyph}
                  </TableCell>
                  <TableCell>
                    <LinkList
                      items={rulers}
                      hrefBase="/reference/astrology/planets"
                    />
                  </TableCell>
                  <TableCell>
                    {exalts ? (
                      <LinkList
                        items={[exalts]}
                        hrefBase="/reference/astrology/planets"
                      />
                    ) : (
                      <Dash />
                    )}
                  </TableCell>
                  <TableCell>{s.symbol}</TableCell>
                  <TableCell>{s.bodyPart}</TableCell>
                  <TableCell>{s.quality}</TableCell>
                  <TableCell>{`${s.alchemy} — ${s.alchemicalStage}`}</TableCell>
                  <TableCell>{s.color}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Houses
        </h2>
        <dl className="divide-y divide-zinc-950/5 border-y border-zinc-950/5 text-sm/6 dark:divide-white/5 dark:border-white/5">
          {houses.map((h) => (
            <div key={h.num} className="py-4">
              <dt className="font-medium text-zinc-950 dark:text-white">
                {ordinal(h.num)} House
              </dt>
              <dd className="mt-1 text-zinc-500 dark:text-zinc-400">
                {h.definition}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  )
}
