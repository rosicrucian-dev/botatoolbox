import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DefinitionList } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PlayLink } from '@/components/PlayLink'
import { PrevNextNav } from '@/components/PrevNextNav'
import { TextLink } from '@/components/TextLink'
import {
  planetBySlug,
  astrologyPlanets as planets,
  signBySlug,
} from '@/content/data'

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
      <SetBreadcrumbs
        items={[
          { label: 'Astrology', href: '/reference/astrology' },
          { label: planet.name },
        ]}
      />
      <KeyboardNav
        prevHref={`/reference/astrology/planets/${prev.slug}`}
        nextHref={`/reference/astrology/planets/${next.slug}`}
      />
      <div className="flex items-start justify-between gap-4">
        <PageHeading>{planet.name}</PageHeading>
        <PlayLink href={`/reference/astrology/planets/${planet.slug}/focus`}>
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
        prev={{ href: `/reference/astrology/planets/${prev.slug}`, label: prev.name }}
        next={{ href: `/reference/astrology/planets/${next.slug}`, label: next.name }}
      />
    </article>
  )
}

function Empty() {
  return <span className="text-zinc-400 dark:text-zinc-600">—</span>
}

function SignLink({ sign }: { sign: { slug: string; name: string } }) {
  return <TextLink href={`/reference/astrology/signs/${sign.slug}`}>{sign.name}</TextLink>
}
