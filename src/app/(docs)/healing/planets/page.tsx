import { type Metadata } from 'next'

import { DataList } from '@/components/DataList'
import { PlayLink } from '@/components/PlayLink'
import { planets } from '@/content/data'
import { getLetterMeta } from '@/lib/hebrew'

export const metadata: Metadata = {
  title: 'Planets',
}

// Healing meditation only covers the 7 classical planets — the modern
// triples (Uranus/Neptune/Pluto) have no chakra attribution.
// Player offsets list rows by 1 (idx=0 is the setup card).
const healingPlanets = planets.filter((p) => p.chakra)
const planetsWithIdx = healingPlanets.map((p, i) => ({ ...p, idx: i + 1 }))

export default function Planets() {
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Planets
        </h1>
        <PlayLink href="/healing/planets/play">Start Exercise ▶</PlayLink>
      </div>

      <DataList
        items={planetsWithIdx}
        getKey={(p) => p.name}
        getHref={(p) => `/healing/planets/play?idx=${p.idx}`}
        primeAudio
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
