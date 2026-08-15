import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DataList } from '@/components/DataList'
import { PageHeading } from '@/components/PageHeading'
import { PlayLink } from '@/components/PlayLink'
import { getPlanets } from '@/content/data'
import { getLetterMeta } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Planets'),
  }
}

export default async function Planets({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { planets } = getPlanets(toLocale(rawLocale))
  // Healing meditation only covers the 7 classical planets — the modern
  // triples (Uranus/Neptune/Pluto) have no chakra attribution.
  // Player offsets list rows by 1 (idx=0 is the setup card).
  const healingPlanets = planets.filter((p) => p.chakra)
  const planetsWithIdx = healingPlanets.map((p, i) => ({ ...p, idx: i + 1 }))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Planets' }]} />
      <div className="flex items-start justify-between gap-4">
        <PageHeading truncate>Planets</PageHeading>
        <PlayLink href="/healing/planets/play">Start Exercise ▶</PlayLink>
      </div>

      <DataList
        items={planetsWithIdx}
        getKey={(p) => p.name}
        getHref={(p) => `/healing/planets/play?idx=${p.idx}`}
        player
        renderRow={(p) => {
          const meta = getLetterMeta(p.letter)
          return (
            <>
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {p.name}
                </div>
                {p.chakra && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {p.chakra}
                  </div>
                )}
              </div>
              <div
                className="font-serif text-3xl leading-none text-zinc-900 dark:text-zinc-100"
                dir="rtl"
                lang="he"
              >
                {meta.glyph}
              </div>
            </>
          )
        }}
      />
    </article>
  )
}
