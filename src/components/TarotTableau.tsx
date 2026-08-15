'use client'

import { Link } from '@/components/LocaleLink'

import type { TarotCard } from '@/content/data'
import { cardImage, thumbImage } from '@/content/data/tarot-images'
import { majorThumbHeight } from '@/content/data/tarot-styles'
import { useTarotStyle } from '@/lib/tarotStyle'

// The 22 majors laid out as a tableau: the Fool centered on its own top row,
// then keys 1–21 filling a 7-wide grid. Used by /tarot/tableau (cards link to
// their detail pages, in the user's chosen Major style) and as the preview on
// the Traditional / Modern download pages (which pin an explicit `style` so
// the preview always matches the file being downloaded).

// How each card behaves when clicked:
//   'none'  — static image (no link)
//   'card'  — links to the in-app card detail page (/tarot/<slug>)
//   'image' — links directly to the full-res image file, opened in a new tab so
//             it can be viewed full-size and downloaded. Not an app route.
type LinkMode = 'none' | 'card' | 'image'

export function TarotTableau({
  cards,
  style,
  link = 'none',
  rounded = true,
}: {
  // The locale's majors, from the server parent's getTarot(locale) —
  // data stays out of the client bundle.
  cards: ReadonlyArray<TarotCard>
  // Pin a specific major style (the download previews). Omit to follow the
  // user's chosen Major style.
  style?: string
  link?: LinkMode
  rounded?: boolean
}) {
  const fool = cards.find((c) => c.num === 0)!
  const keys = cards.filter((c) => c.num !== 0)
  const { majorStyle } = useTarotStyle()
  const effective = style ?? majorStyle

  const imgClass = `w-full ${rounded ? 'rounded-md ' : ''}shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800`
  const linkClass = 'block transition hover:-translate-y-0.5 hover:opacity-90'

  const card = (c: TarotCard) => {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbImage(c, effective)}
        alt={`${c.num}. ${c.name}`}
        width={362}
        height={majorThumbHeight(effective)}
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
          href={cardImage(c, effective)}
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
