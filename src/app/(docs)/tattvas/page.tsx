import { type Metadata } from 'next'

import { PlayLink } from '@/components/PlayLink'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
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

      {/* A column per main tattva, a row per sub. Each cell links to that main's
          player at the sub's index (e.g. Water column, Fire row → Fire of
          Water). Built on Catalyst's <Table> for consistent styling, but the
          body cells are raw <td> + a full-cell PlayLink (Catalyst's TableCell
          can't host a padding-filling link, and these cells double as the
          audio-priming nav targets). */}
      <Table className="[--gutter:1rem] sm:[--gutter:1.5rem] lg:[--gutter:2rem]">
        <TableHead>
          <TableRow>
            {tattvas.map((main) => (
              <TableHeader key={main.kind}>{main.english}</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {SUB_ROWS.map((r) => (
            <TableRow key={r.sub}>
              {tattvas.map((main, colIdx) => {
                // Match Catalyst's <TableHeader> edge padding so the body
                // cells line up under their headers. Catalyst hugs the
                // first/last cells to the table's padded edge
                // (first:pl-(--gutter), then sm:first:pl-1); middle cells are
                // plain px-4. Mirror that on the full-cell PlayLink.
                const edge =
                  colIdx === 0
                    ? 'pl-(--gutter) pr-4 sm:pl-1'
                    : colIdx === tattvas.length - 1
                      ? 'pl-4 pr-(--gutter) sm:pr-1'
                      : 'px-4'
                return (
                  <td
                    key={main.kind}
                    className="border-b border-zinc-950/5 dark:border-white/5"
                  >
                    <PlayLink
                      href={`/tattvas/${main.kind}/play?idx=${r.idx}`}
                      className={`block ${edge} py-4 font-medium whitespace-nowrap text-zinc-950 transition hover:bg-zinc-950/2.5 dark:text-white dark:hover:bg-white/2.5`}
                    >
                      {tattvaByKind[r.sub].english}
                    </PlayLink>
                  </td>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
