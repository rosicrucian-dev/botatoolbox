import { getMinorArcana, minorImage } from '@/content/data/minor-arcana'
import { DEFAULT_MINOR_STYLE } from '@/content/data/tarot-styles'
import { DEFAULT_LOCALE } from '@/lib/locales'

// Deliberately static/English (suit names + "N of Suit" alt text): this
// is the Files viewer's preview gallery for a fixed English-titled
// download, and staying locale-free keeps it a server component.
const { minorCards, suits } = getMinorArcana(DEFAULT_LOCALE)

// All 56 minors as a preview gallery for the Files viewer, grouped one section
// per suit (Wands, Cups, Swords, Pentacles). Each card is a lightweight preview
// linking to the full image opened in a new tab — the same click→full-size
// behaviour as TarotTableau's link="image" for majors. The Josh Yates minors
// have a single small resolution (~11–56 KB each), so the full image doubles as
// the preview; `loading="lazy"` keeps offscreen suits from loading up front.
// Static (one fixed style, no interactivity) so it stays a server component.

const STYLE = DEFAULT_MINOR_STYLE // 'josh-yates'

export function MinorTableau() {
  return (
    <div className="space-y-8">
      {suits.map((suit) => (
        <section key={suit.suit} className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {suit.suit}
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 md:gap-3">
            {minorCards
              .filter((c) => c.suit === suit.suit)
              .map((c) => (
                <a
                  key={c.slug}
                  href={minorImage(c, STYLE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open full-size image — ${c.num} of ${c.suit}`}
                  className="block transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={minorImage(c, STYLE)}
                    alt={`${c.num} of ${c.suit}`}
                    width={270}
                    height={466}
                    loading="lazy"
                    className="w-full rounded-md shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                  />
                </a>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
