import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataTable } from '@/components/ui/DataTable'
import { TextLink } from '@/components/ui/TextLink'
import { getSuitCorrespondences, getTarot } from '@/content/data'
import { letters } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Major Arcana')

// THE KEYS' TABLE — every Major Arcanum's letter, path, astrology,
// colour, note and Intelligence, and the four suits under it.
//
// SEVEN COLUMNS, which is the Hermetic Order of Aquarius's cut and is
// now this one (10 November 2026). This page carried thirteen, and the
// six it has given up are each at home elsewhere on both sites rather
// than lost: English, Letter significance and Gematria are three
// columns of /correspondences/hebrew, which reads these same 22 rows;
// Alchemy, Power and Human / Opposite are on each Key's own page,
// /tarot/<slug>. A fact has one home, and a thirteen-column table that
// had to be scrolled sideways under a pinned first column was the
// thing that made the rule worth keeping.
//
// The tableau of the cards themselves is /major-arcana.
export default async function MajorArcanaTable({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { cards } = getTarot(locale)
  const { suitCorrespondences } = getSuitCorrespondences(locale)
  return (
    <article className="space-y-8">
      <SetBreadcrumbs
        items={[
          { label: 'Correspondences', href: '/correspondences' },
          { label: 'Major Arcana' },
        ]}
      />
      <PageHeading>Major Arcana</PageHeading>

      <DataTable
        nowrap
        head={[
          'Key',
          'Letter',
          'Path',
          'Astrology',
          'Color',
          'Note',
          'Intelligence',
        ]}
        rows={cards.map((c) => [
          <TextLink key={c.slug} href={`/tarot/${c.slug}`}>
            {c.num}. {c.name}
          </TextLink>,
          `${letters[c.letter]?.glyph ?? ''} ${c.letter}`,
          c.path,
          c.astrology,
          c.color,
          c.note,
          c.intelligence,
        ])}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Suits
        </h2>
        <DataTable
          head={['Tarot', 'Playing card', 'World', 'Element', 'Letter']}
          rows={suitCorrespondences.map((s) => [
            s.tarot,
            s.playingCard,
            s.world,
            s.element,
            s.letter,
          ])}
        />
      </section>
    </article>
  )
}
