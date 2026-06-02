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

      {tattvas.map((main) => (
        <section key={main.kind} className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {main.english}
          </h2>
          <DataList
            items={SUB_ROWS}
            getKey={(r) => r.sub}
            getHref={(r) => `/tattvas/${main.kind}/play?idx=${r.idx}`}
            primeAudio
            rowClassName="-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
            renderRow={(r) => <>{tattvaByKind[r.sub].english}</>}
          />
        </section>
      ))}
    </article>
  )
}
