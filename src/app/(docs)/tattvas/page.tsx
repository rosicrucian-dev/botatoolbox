import { type Metadata } from 'next'

import { PlayLink } from '@/components/PlayLink'
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
// shape the list as { sub, idx } pairs so each row keys off sub.
type Row = { sub: TattvaKind; idx: number }
const SUB_ROWS: Array<Row> = SUB_ORDER.map((sub, idx) => ({ sub, idx }))

export default function Tattvas() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Tattvas
      </h1>

      {/* One table: a column per main tattva, a row per sub tattva. Each cell
          links to that main's player at the sub's index (e.g. Water column,
          Fire row → Fire of Water). Names are short single words, so all five
          columns fit even on a phone; the wrapper scrolls if they don't. */}
      <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full px-4 sm:px-6 lg:px-8">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {tattvas.map((main) => (
                  <Th key={main.kind}>{main.english}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUB_ROWS.map((r) => (
                <tr key={r.sub}>
                  {tattvas.map((main) => (
                    <td
                      key={main.kind}
                      className="border-b border-zinc-200 dark:border-zinc-800"
                    >
                      <PlayLink
                        href={`/tattvas/${main.kind}/play?idx=${r.idx}`}
                        className="block rounded-sm px-3 py-3 font-medium whitespace-nowrap text-zinc-900 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
                      >
                        {tattvaByKind[r.sub].english}
                      </PlayLink>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="border-b border-zinc-200 px-3 py-3 text-left font-semibold whitespace-nowrap text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
    >
      {children}
    </th>
  )
}
