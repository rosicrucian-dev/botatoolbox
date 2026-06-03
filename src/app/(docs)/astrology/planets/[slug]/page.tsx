import { notFound } from 'next/navigation'
import Link from 'next/link'
import { type Metadata } from 'next'

import { DefinitionList } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PlayLink } from '@/components/PlayLink'
import { PrevNextNav } from '@/components/PrevNextNav'
import { planets, planetBySlug, signBySlug } from '@/content/data/astrology'

export function generateStaticParams() {
  return planets.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const planet = planetBySlug[slug]
  return { title: planet?.name ?? 'Planet' }
}

export default async function PlanetPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const planet = planetBySlug[slug]
  if (!planet) notFound()

  const ruled = planet.rules
    .map((s) => signBySlug[s])
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
  const exalts = planet.exaltedIn ? signBySlug[planet.exaltedIn] : null

  // Cyclic prev/next through the chakra-meditation order in planets.json
  // (Saturn → Pluto, then wraps).
  const i = planets.findIndex((p) => p.slug === planet.slug)
  const prev = planets[(i - 1 + planets.length) % planets.length]
  const next = planets[(i + 1) % planets.length]

  return (
    <article className="space-y-6">
      <KeyboardNav
        prevHref={`/astrology/planets/${prev.slug}`}
        nextHref={`/astrology/planets/${next.slug}`}
      />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          {planet.name}
        </h1>
        <PlayLink href={`/astrology/planets/${planet.slug}/focus`}>
          Focus ▶
        </PlayLink>
      </div>

      <DefinitionList
        rows={[
          {
            label: 'Ruler',
            value:
              ruled.length === 0 ? (
                <Empty />
              ) : (
                ruled.map((s, i) => (
                  <span key={s.slug}>
                    <SignLink sign={s} />
                    {i < ruled.length - 1 ? ', ' : null}
                  </span>
                ))
              ),
          },
          {
            label: 'Exaltation',
            value: exalts ? <SignLink sign={exalts} /> : <Empty />,
          },
          { label: 'Alchemy', value: planet.alchemy },
          { label: 'Color', value: planet.color },
        ]}
      />

      <PrevNextNav
        prev={{ href: `/astrology/planets/${prev.slug}`, label: prev.name }}
        next={{ href: `/astrology/planets/${next.slug}`, label: next.name }}
      />
    </article>
  )
}

function Empty() {
  return <span className="text-zinc-400 dark:text-zinc-600">—</span>
}

function SignLink({ sign }: { sign: { slug: string; name: string } }) {
  return (
    <Link
      href={`/astrology/signs/${sign.slug}`}
      className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
    >
      {sign.name}
    </Link>
  )
}
