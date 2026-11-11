import { PageHeading } from '@/components/layout/PageHeading'
import { PlayLink } from '@/components/nav/PlayLink'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { TattvaSymbol } from '@/components/tattva/TattvaSymbol'
import { DataTable } from '@/components/ui/DataTable'
import { Dash } from '@/components/ui/TableCells'
import { getElements, getTattvas } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { SUB_ORDER, tattvaByKind, tattvas, type TattvaKind } from '@/lib/tattvas'

export const generateMetadata = localizedMetadata('Five Phases')

// FIVE PHASES OF LIFE EXPRESSION — the second rung of the Alchemy
// group's ladder: Three Principles, Five Phases, Seven Forces, Twelve
// Channels.
//
// EAST AND WEST IN ONE TABLE (10 November 2026). /correspondences/
// tattvas and /correspondences/elements were two tables until that day,
// and they are one: the five tattvas ARE the four elements with Spirit,
// and the lessons say so in those words — "Western occultism calls it
// water" (Apas), "the element of fire which is usually termed tejas".
// The rule, which also folded the chakras into the Seven Forces: A
// TABLE IS A THING, NOT A TRADITION'S ACCOUNT OF A THING.
//
// Spirit has no triangle, no elementals and no kerub, and prints a dash
// in all three — the four-element scheme has no room for it, which is
// the fact and not a gap in the data.
//
// The symbol that keys the table is the TATTVA's, because it is the one
// every row has: the alchemical triangles exist for four.
//
// THE TWENTY-FIVE ARE PLAYABLE HERE, which is this site's half of the
// pair: the Hermetic Order of Aquarius prints the same grid as figures
// and links across to this player. The deck is addressed by the main
// tattva and the sub's index within it.

// The classical element glyphs are derived from the slug rather than
// stored — an upward triangle (Fire), a downward triangle (Water), and
// their barred forms (Air, Earth). See content/data/README.md on the
// "symbols derived, never stored" convention.
function ElementSymbol({ slug }: { slug: string }) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6 text-zinc-900 dark:text-white"
    >
      {slug === 'fire' && <polygon points="12,3 21,20 3,20" {...stroke} />}
      {slug === 'water' && <polygon points="3,4 21,4 12,21" {...stroke} />}
      {slug === 'air' && (
        <>
          <polygon points="12,3 21,20 3,20" {...stroke} />
          <line x1="8.6" y1="14" x2="15.4" y2="14" {...stroke} />
        </>
      )}
      {slug === 'earth' && (
        <>
          <polygon points="3,4 21,4 12,21" {...stroke} />
          <line x1="8.6" y1="10" x2="15.4" y2="10" {...stroke} />
        </>
      )}
    </svg>
  )
}

// The five simple letters carry sight, hearing, smell, taste and touch
// (Sound and Color 12), and each tattva IS the subtle principle of one
// of those senses — so the letter FOLLOWS FROM the sense and is not a
// column of the data. This map is the whole of the inference.
const LETTER_OF_SENSE: Record<string, string> = {
  Sight: 'ה',
  Hearing: 'ו',
  Smell: 'ז',
  Taste: 'ט',
  Touch: 'י',
}

export default async function PhasesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { elements } = getElements(locale)
  const { tattvaRows } = getTattvas(locale)
  const western = (slug: string) => elements.find((e) => e.slug === slug)
  return (
    <article className="space-y-8">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Five Phases' },
        ]}
      />
      <PageHeading>Five Phases</PageHeading>

      <DataTable
        head={[
          'Symbol',
          'Triangle',
          'Element',
          'Tattva',
          'Sense',
          'Letter',
          'Quality',
          'Action',
          'Relating to',
          'Elementals',
          'Kerub',
        ]}
        rows={tattvaRows.map((t) => {
          const w = western(t.kind)
          return [
            <span key="sym" id={t.kind} className="block h-10 w-10 scroll-mt-24">
              <TattvaSymbol main={t.kind as TattvaKind} />
            </span>,
            w ? <ElementSymbol key="tri" slug={t.kind} /> : <Dash key="tri" />,
            t.element,
            t.name,
            t.sense,
            <span key="letter" lang="he" dir="rtl" className="text-xl/none">
              {LETTER_OF_SENSE[t.sense]}
            </span>,
            w?.quality ?? <Dash key="q" />,
            t.quality,
            w?.relatingTo ?? <Dash key="r" />,
            w?.spirit ?? <Dash key="s" />,
            w?.kerub ?? <Dash key="k" />,
          ]
        })}
      />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          The twenty-five
        </h2>
        <p className="max-w-2xl text-sm/6 text-zinc-600 dark:text-zinc-400">
          Each element within each, as the tattva cards are drawn. A column per
          main tattva, a row per sub; each one flashes for the afterimage.
        </p>
        <div className="grid grid-cols-5 gap-3 sm:gap-5">
          {tattvas.map((main) =>
            SUB_ORDER.map((sub, idx) => ({ main, sub, idx })),
          )
            .flat()
            .map(({ main, sub, idx }) => (
              <PlayLink
                key={`${main.kind}-${sub}`}
                href={`/correspondences/phases/${main.kind}/play?idx=${idx}`}
                className="block space-y-1 rounded-md p-1 transition hover:bg-zinc-950/2.5 dark:hover:bg-white/2.5"
              >
                <span className="block rounded-md bg-white p-2 ring-1 ring-zinc-950/10">
                  <TattvaSymbol main={main.kind} sub={sub} />
                </span>
                <span className="block text-center text-xs/5 text-zinc-600 dark:text-zinc-400">
                  {tattvaByKind[sub].english} of {main.english}
                </span>
              </PlayLink>
            ))}
        </div>
      </section>
    </article>
  )
}
