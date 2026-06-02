import { notFound } from 'next/navigation'
import Link from 'next/link'
import { type Metadata } from 'next'

import { Button } from '@/components/Button'
import { DefinitionList } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PlayLink } from '@/components/PlayLink'
import { signs, signBySlug, planetBySlug } from '@/content/data/astrology'

export function generateStaticParams() {
  return signs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sign = signBySlug[slug]
  return { title: sign?.name ?? 'Sign' }
}

export default async function SignPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sign = signBySlug[slug]
  if (!sign) notFound()

  const rulers = sign.rulers
    .map((p) => planetBySlug[p])
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const exalts = sign.exaltedBy ? planetBySlug[sign.exaltedBy] : null

  // Cyclic prev/next through the zodiac order in signs.json
  // (Aries → Pisces, then wraps).
  const i = signs.findIndex((s) => s.slug === sign.slug)
  const prev = signs[(i - 1 + signs.length) % signs.length]
  const next = signs[(i + 1) % signs.length]

  return (
    <article className="space-y-6">
      <KeyboardNav
        prevHref={`/astrology/signs/${prev.slug}`}
        nextHref={`/astrology/signs/${next.slug}`}
      />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          {sign.name}
        </h1>
        <PlayLink href={`/astrology/signs/${sign.slug}/focus`}>
          Focus ▶
        </PlayLink>
      </div>

      <DefinitionList
        rows={[
          {
            label: 'Ruler',
            value:
              rulers.length === 0 ? (
                <Empty />
              ) : (
                rulers.map((p, i) => (
                  <span key={p.slug}>
                    <PlanetLink planet={p} />
                    {i < rulers.length - 1 ? ', ' : null}
                  </span>
                ))
              ),
          },
          {
            label: 'Exaltation',
            value: exalts ? <PlanetLink planet={exalts} /> : <Empty />,
          },
          { label: 'Body', value: sign.bodyPart },
          { label: 'Quality', value: sign.quality },
          { label: 'Alchemy', value: sign.alchemy },
          { label: 'Color', value: sign.color },
        ]}
      />

      <nav className="flex">
        <div className="flex flex-col items-start gap-3">
          <Button
            href={`/astrology/signs/${prev.slug}`}
            aria-label={`Previous: ${prev.name}`}
            variant="secondary"
            arrow="left"
          >
            Previous
          </Button>
          <Link
            href={`/astrology/signs/${prev.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="text-base font-semibold text-zinc-900 transition hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
          >
            {prev.name}
          </Link>
        </div>
        <div className="ml-auto flex flex-col items-end gap-3">
          <Button
            href={`/astrology/signs/${next.slug}`}
            aria-label={`Next: ${next.name}`}
            variant="secondary"
            arrow="right"
          >
            Next
          </Button>
          <Link
            href={`/astrology/signs/${next.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="text-base font-semibold text-zinc-900 transition hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
          >
            {next.name}
          </Link>
        </div>
      </nav>
    </article>
  )
}

function Empty() {
  return <span className="text-zinc-400 dark:text-zinc-600">—</span>
}

function PlanetLink({
  planet,
}: {
  planet: { slug: string; name: string }
}) {
  return (
    <Link
      href={`/astrology/planets/${planet.slug}`}
      className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
    >
      {planet.name}
    </Link>
  )
}
