import { MajorImage } from '@/components/CardImage'
import { DefinitionList } from '@/components/DefinitionList'
import { KeyboardNav } from '@/components/KeyboardNav'
import { PageHeading } from '@/components/PageHeading'
import { PlayLink } from '@/components/PlayLink'
import { PrevNextNav } from '@/components/PrevNextNav'
import { TextLink } from '@/components/TextLink'
import {
  cards,
  paths,
  planetBySlug,
  sephirahBySlug,
  signBySlug,
  type TarotCard,
} from '@/content/data'
import { CardImageLink } from './CardImageLink'
import { CardStack } from './CardStack'

const FIELD_ORDER: Array<{
  label: string
  key: keyof TarotCard
}> = [
  { label: 'Color', key: 'color' },
  { label: 'Note', key: 'note' },
  { label: 'Letter', key: 'letter' },
  { label: 'English', key: 'english' },
  { label: 'Path', key: 'path' },
  { label: 'Letter Significance', key: 'significance' },
  { label: 'Gematria', key: 'gematria' },
  { label: 'Astrology', key: 'astrology' },
  { label: 'Alchemy', key: 'alchemy' },
  { label: 'Intelligence', key: 'intelligence' },
  { label: 'Power', key: 'power' },
  // Label for `human` is resolved per-card in the render below:
  // 'Opposites' on planet cards, 'Human Faculty' on sign cards.
  { label: 'Human Faculty', key: 'human' },
]

// The major-arcana card detail. Served at /tarot/<slug> (named slug or numeric
// alias); the minor arcana share the same route via <MinorCard>.
export function MajorCard({ card }: { card: TarotCard }) {
  const prev = cards.find(
    (c) => c.num === (card.num + cards.length - 1) % cards.length,
  )!
  const next = cards.find((c) => c.num === (card.num + 1) % cards.length)!

  return (
    <article className="space-y-6">
      <KeyboardNav
        prevHref={`/tarot/${prev.slug}`}
        nextHref={`/tarot/${next.slug}`}
      />
      <CardStack
        header={
          <PageHeading truncate>{card.name}</PageHeading>
        }
        actions={
          <PlayLink href={`/tarot/major-arcana/play?idx=${card.num}`}>
            Focus ▶
          </PlayLink>
        }
        meta={
          <DefinitionList
            rows={FIELD_ORDER.map(({ label, key }) => {
              const raw = String(card[key])
              // `path` row appends the from→to sephiroth in parens.
              // Direction comes from tree-paths.json (top-to-bottom
              // descent order). Each sephirah name links to its detail
              // page using the same underline styling as the astrology
              // link above.
              if (key === 'path') {
                const p = paths.find((tp) => tp.slug === card.slug)
                if (p) {
                  const from = sephirahBySlug[p.from]
                  const to = sephirahBySlug[p.to]
                  if (from && to) {
                    return {
                      label,
                      value: (
                        <>
                          {raw} (
                          <TextLink href={`/tree-of-life/${from.slug}`}>
                            {from.hebrewName}
                          </TextLink>
                          {' → '}
                          <TextLink href={`/tree-of-life/${to.slug}`}>
                            {to.hebrewName}
                          </TextLink>
                          )
                        </>
                      ),
                    }
                  }
                }
                return { label, value: raw }
              }
              // `human` row gets a different label depending on whether
              // this card is attributed to a planet ("Opposites") or a
              // sign ("Human Faculty").
              if (key === 'human') {
                const isPlanetCard =
                  planetBySlug[card.astrology.toLowerCase()] !== undefined
                return {
                  label: isPlanetCard ? 'Opposites' : 'Human Faculty',
                  value: raw,
                }
              }
              // For sign-attributed cards, append the sign's alchemical
              // stage to the Alchemy row — e.g. "Fiery — Calcination"
              // for the Emperor. Planet-attributed cards (Magician,
              // High Priestess, …) show just the alchemy attribute.
              if (key === 'alchemy') {
                const sign = signBySlug[card.astrology.toLowerCase()]
                if (sign) {
                  return {
                    label,
                    value: `${raw} — ${sign.alchemicalStage}`,
                  }
                }
              }
              // The Astrology cell links to the corresponding planet or
              // sign detail page. Slug is just the lowercased name —
              // every card's astrology resolves to either a planet or
              // sign (enforced by integrity.ts at boot).
              if (key === 'astrology') {
                const astroSlug = card.astrology.toLowerCase()
                const href = planetBySlug[astroSlug]
                  ? `/reference/astrology/planets/${astroSlug}`
                  : signBySlug[astroSlug]
                    ? `/reference/astrology/signs/${astroSlug}`
                    : null
                if (href) {
                  return {
                    label,
                    value: <TextLink href={href}>{raw}</TextLink>,
                  }
                }
              }
              return { label, value: raw }
            })}
          />
        }
        image={
          <CardImageLink
            imageHref={`/tarot/${card.slug}/image`}
            nextHref={`/tarot/${next.slug}`}
          >
            <MajorImage
              card={card}
              alt={`${card.num}. ${card.name}`}
              width={724}
              height={1200}
              className="w-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
            />
          </CardImageLink>
        }
      />

      <PrevNextNav
        prev={{
          href: `/tarot/${prev.slug}`,
          label: `${prev.num}. ${prev.name}`,
        }}
        next={{
          href: `/tarot/${next.slug}`,
          label: `${next.num}. ${next.name}`,
        }}
      />
    </article>
  )
}
