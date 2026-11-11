import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { Dash } from '@/components/ui/TableCells'
import { getAstrology, getStages, getTarot } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Twelve Channels')

// THE TWELVE CHANNELS — one operation of the Great Work to each sign,
// in the signs' own order, which is the Work's. The last rung of the
// Alchemy group's ladder: Three Principles, Five Phases, Seven Forces,
// Twelve Channels.
//
// Keyed on the SIGN: a channel is where the one force works, and the
// stage is the work it does there, which is why the sequence of the
// Work is the sequence of the signs.
//
// IT IS THE SAME TWELVE AS /correspondences/signs, deliberately, and
// divided the same way the Seven Forces are divided from the Planets:
// this table is the Work's reading — the stage, what it does, the Key,
// the part of the body — and Signs is the astrology. The BODY column
// came here from Signs, so no column stands in both.
//
// The Key is derived through the sign's letter and cannot drift from
// the Tarot table.
export default async function ChannelsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { signBySlug } = getAstrology(locale)
  const { stages } = getStages(locale)
  const { cardByLetter } = getTarot(locale)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Twelve Channels' },
        ]}
      />
      <PageHeading>Twelve Channels</PageHeading>
      <DataTable
        head={['#', 'Symbol', 'Channel', 'Stage', 'Process', 'Key', 'Body']}
        rows={stages.map((x, i) => {
          const s = signBySlug[x.sign]
          const key = s ? cardByLetter[s.letter] : undefined
          return [
            i + 1,
            <span key="glyph" id={x.sign} className="scroll-mt-24 text-lg/none">
              {/* The glyph already carries U+FE0E (signs.ts). */}
              {s?.glyph}
            </span>,
            s?.name ?? x.sign,
            x.name,
            x.process,
            key ? `${key.num}. ${key.name}` : '',
            s?.bodyPart ?? <Dash key="body" />,
          ]
        })}
      />
    </article>
  )
}
