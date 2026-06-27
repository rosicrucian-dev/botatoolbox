import Link from 'next/link'

import { cards, type TarotCard } from '@/content/data/tarot'

// The 22 majors laid out as a tableau: the Fool centered on its own top row,
// then keys 1–21 filling a 7-wide grid. Used by /tarot/tableau (linked) and as
// the preview on the Tarot Images / Tarot Alt Images download pages.
type Variant = 'major' | 'major-alt'

// `major` thumbs are 362×600; the alternate deck is a slightly taller crop.
const THUMB_HEIGHT: Record<Variant, number> = { major: 600, 'major-alt': 635 }

const thumbUrl = (variant: Variant, c: Pick<TarotCard, 'num' | 'slug'>) =>
  `/tarot/${variant}/thumbs/${c.num}-${c.slug}.jpg`

const fool = cards.find((c) => c.num === 0)!
const keys = cards.filter((c) => c.num !== 0)

export function TarotTableau({
  variant = 'major',
  linked = false,
  rounded = true,
}: {
  variant?: Variant
  linked?: boolean
  rounded?: boolean
}) {
  const imgClass = `w-full ${rounded ? 'rounded-md ' : ''}shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800`
  const card = (c: TarotCard) => {
    const img = (
      <img
        src={thumbUrl(variant, c)}
        alt={`${c.num}. ${c.name}`}
        width={362}
        height={THUMB_HEIGHT[variant]}
        loading="lazy"
        className={imgClass}
      />
    )
    return linked ? (
      <Link
        href={`/tarot/${c.slug}`}
        className="block transition hover:-translate-y-0.5 hover:opacity-90"
      >
        {img}
      </Link>
    ) : (
      img
    )
  }

  return (
    <div className="grid grid-cols-7 gap-1 md:gap-3">
      <div className="col-span-7 grid grid-cols-7 gap-1 md:gap-3">
        <div className="col-start-4">{card(fool)}</div>
      </div>
      {keys.map((c) => (
        <div key={c.num}>{card(c)}</div>
      ))}
    </div>
  )
}
