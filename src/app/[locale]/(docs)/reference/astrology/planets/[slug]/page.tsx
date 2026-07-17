import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DefinitionList } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PlayLink } from '@/components/PlayLink'
import { PrevNextNav } from '@/components/PrevNextNav'
import { TextLink } from '@/components/TextLink'
import { getAstrology } from '@/content/data'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

export function generateStaticParams() {
  // Structural (slug) enumeration — English source on purpose.
  return getAstrology(DEFAULT_LOCALE).astrologyPlanets.map((p) => ({
    slug: p.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const planet = getAstrology(toLocale(locale)).planetBySlug[slug]
  return { title: planet?.name ?? 'Planet' }
}

export default async function PlanetPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const { astrologyPlanets, planetBySlug, signBySlug } = getAstrology(
    toLocale(rawLocale),
  )
  const planet = planetBySlug[slug]
  if (!planet) notFound()

  const ruled = planet.rules
    .map((s) => signBySlug[s])
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
  const exalts = planet.exaltedIn ? signBySlug[planet.exaltedIn] : null

  // Cyclic prev/next through the chakra-meditation order in planets.json
  // (Saturn → Pluto, then wraps).
  const i = astrologyPlanets.findIndex((p) => p.slug === planet.slug)
  const prev =
    astrologyPlanets[
      (i - 1 + astrologyPlanets.length) % astrologyPlanets.length
    ]
  const next = astrologyPlanets[(i + 1) % astrologyPlanets.length]

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
        <PageHeading truncate>{planet.name}</PageHeading>
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
        prev={{
          href: `/reference/astrology/planets/${prev.slug}`,
          label: prev.name,
        }}
        next={{
          href: `/reference/astrology/planets/${next.slug}`,
          label: next.name,
        }}
      />
    </article>
  )
}

function Empty() {
  return <span className="text-zinc-400 dark:text-zinc-600">—</span>
}

function SignLink({ sign }: { sign: { slug: string; name: string } }) {
  return (
    <TextLink href={`/reference/astrology/signs/${sign.slug}`}>
      {sign.name}
    </TextLink>
  )
}
