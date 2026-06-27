import { type Metadata } from 'next'

import { DataList } from '@/components/DataList'
import {
  tattvas,
  tattvaByKind,
  SUB_ORDER,
  type TattvaKind,
} from '@/lib/tattvas'

export const metadata: Metadata = {
  title: 'Tattvas',
}

// Sub-tattvas are addressed by index inside each main's player deck —
// shape the list as { sub, idx } pairs so DataList can use sub as a key.
type Row = { sub: TattvaKind; idx: number }
const SUB_ROWS: Array<Row> = SUB_ORDER.map((sub, idx) => ({ sub, idx }))

export default function Tattvas() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Tattvas
      </h1>

      {/* One section, five columns (one per main tattva). Names are short
          single words, so all five fit side-by-side even on a phone. */}
      <section className="grid grid-cols-5 gap-x-3 sm:gap-x-6">
        {tattvas.map((main) => (
          <div key={main.kind} className="space-y-2 sm:space-y-3">
            <h2 className="text-base font-semibold text-zinc-900 sm:text-xl dark:text-zinc-100">
              {main.english}
            </h2>
            <DataList
              items={SUB_ROWS}
              getKey={(r) => r.sub}
              getHref={(r) => `/tattvas/${main.kind}/play?idx=${r.idx}`}
              primeAudio
              rowClassName="-mx-1 flex items-center justify-between gap-4 rounded-sm px-1 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 sm:-mx-2 sm:px-2 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
              renderRow={(r) => <>{tattvaByKind[r.sub].english}</>}
            />
          </div>
        ))}
      </section>
    </article>
  )
}
