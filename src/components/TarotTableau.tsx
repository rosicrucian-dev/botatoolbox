import Link from 'next/link'

import { cards, type TarotCard } from '@/content/data/tarot'

// The 22 majors laid out as a tableau: the Fool centered on its own top row,
// then keys 1–21 filling a 7-wide grid. Used by /tarot/tableau (cards link to
// their detail pages) and as the preview on the Tarot Images / Tarot Alt Images
// download pages (cards link straight to the full-resolution image file).
type Variant = 'major' | 'major-alt'

// How each card behaves when clicked:
//   'none'  — static image (no link)
//   'card'  — links to the in-app card detail page (/tarot/<slug>)
//   'image' — links directly to the full-res image file, opened in a new tab so
//             it can be viewed full-size and downloaded. Not an app route.
type LinkMode = 'none' | 'card' | 'image'

// `major` thumbs are 362×600; the alternate deck is a slightly taller crop.
const THUMB_HEIGHT: Record<Variant, number> = { major: 600, 'major-alt': 635 }

const thumbUrl = (variant: Variant, c: Pick<TarotCard, 'num' | 'slug'>) =>
  `/tarot/${variant}/thumbs/${c.num}-${c.slug}.jpg`

// Full-resolution image (same folder as the thumbs, minus /thumbs/).
const fullUrl = (variant: Variant, c: Pick<TarotCard, 'num' | 'slug'>) =>
  `/tarot/${variant}/${c.num}-${c.slug}.jpg`

const fool = cards.find((c) => c.num === 0)!
const keys = cards.filter((c) => c.num !== 0)

export function TarotTableau({
  variant = 'major',
  link = 'none',
  rounded = true,
}: {
  variant?: Variant
  link?: LinkMode
  rounded?: boolean
}) {
  const imgClass = `w-full ${rounded ? 'rounded-md ' : ''}shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800`
  const linkClass = 'block transition hover:-translate-y-0.5 hover:opacity-90'

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
    if (link === 'card') {
      return (
        <Link href={`/tarot/${c.slug}`} className={linkClass}>
          {img}
        </Link>
      )
    }
    if (link === 'image') {
      return (
        <a
          href={fullUrl(variant, c)}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open full-size image — ${c.num}. ${c.name}`}
          className={linkClass}
        >
          {img}
        </a>
      )
    }
    return img
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
