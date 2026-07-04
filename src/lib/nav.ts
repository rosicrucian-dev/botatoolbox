import { visibleRituals, visibleTexts } from '@/content/data'

export interface NavLink {
  title: string
  href: string
  // Used by the home page TOC cards. Sidebar nav ignores this.
  description?: string
}

export interface NavGroup {
  title: string
  links: Array<NavLink>
  // When set, the group is hidden from the sidebar and home TOC unless
  // the user has unlocked secret mode via /settings. The gated
  // routes themselves redirect to /settings if visited directly
  // (see src/app/(docs)/meditations/layout.tsx).
  gated?: 'secret'
}

// Category groups are kept here in any convenient order; the export sorts them
// alphabetically by title so the sidebar nav and home TOC stay in order as
// groups are added or renamed. Links within a group keep their authored order.
const groups: Array<NavGroup> = [
  {
    title: 'Tarot',
    links: [
      {
        title: 'Correspondences',
        href: '/tarot/correspondences',
        description:
          'Every major arcana attribution side-by-side in a single table.',
      },
      {
        title: 'Freeform',
        href: '/tarot/freeform',
        description:
          'Draw cards from the full deck onto a tabletop — drag, arrange, and lay out spreads.',
      },
      {
        title: 'Major Arcana',
        href: '/tarot/major-arcana',
        description: 'The 22 trumps in numerical order.',
      },
      {
        title: 'Minor Arcana',
        href: '/tarot/minor-arcana',
        description:
          'Keywords for the 40 numbered cards across Wands, Cups, Swords, and Pentacles.',
      },
      {
        title: 'Tableau',
        href: '/tarot/tableau',
        description:
          'The major arcana arranged in BOTA’s standard tableau pattern.',
      },
    ],
  },
  {
    title: 'Devices',
    links: [
      {
        title: 'Cube of Space',
        href: '/cube-of-space',
        description:
          'An interactive 3D cube where each face is a tarot card and each edge a Hebrew letter. Drag to rotate; tap Expand to study full-screen.',
      },
      {
        title: 'Tree of Life',
        href: '/tree-of-life',
        description:
          'The ten sephiroth and twenty-two paths of the Qabalah, with each path tied to its corresponding tarot major.',
      },
    ],
  },
  {
    title: 'Healing',
    links: [
      {
        title: 'Planets',
        href: '/healing/planets',
        description:
          'Guided color and tone meditations for the seven planetary letters. Includes a four-fold breath cycle and the IAO mantra.',
      },
      {
        title: 'Signs',
        href: '/healing/signs',
        description:
          'Color and tone meditations for the twelve zodiacal letters, organized by their corresponding body part.',
      },
    ],
  },
  {
    // Generated from content/data/rituals.json (order + titles live there).
    title: 'Rituals',
    links: visibleRituals.map((r) => ({
      title: r.title,
      href: `/rituals/${r.slug}`,
      description: r.description,
    })),
  },
  {
    // Generated from content/data/texts.json (order + titles live there).
    // Hidden texts — e.g. Chaldean Oracles — are excluded via visibleTexts
    // but stay reachable by direct URL.
    title: 'Texts',
    links: visibleTexts.map((t) => ({
      title: t.title,
      href: `/texts/${t.slug}`,
    })),
  },
  {
    title: 'Gematria',
    links: [
      {
        title: 'Calculator',
        href: '/gematria/calculator',
        description:
          'A Hebrew letter calculator. Tap letters to spell a word; the gematria total updates and the corresponding tarot trumps appear above.',
      },
      {
        title: 'Dictionary',
        href: '/gematria/dictionary',
        description:
          'Enter a number to see the Hebrew words and phrases that share that gematria value.',
      },
    ],
  },
  {
    title: 'Astrology',
    links: [
      {
        title: 'Chart',
        href: '/astrology/chart',
        description:
          'The current positions of the ten bodies on a tropical zodiac wheel, computed live for the present moment.',
      },
      {
        title: 'Hora',
        href: '/astrology/hora',
        description:
          'Planetary hours computed for your location — the ruling planet of the current hour, and the hours ahead.',
      },
    ],
  },
  {
    title: 'Utilities',
    links: [
      {
        title: 'Keyboard',
        href: '/keyboard',
        description:
          'A 12-key chromatic keyboard, one key per simple letter. Press and hold to sustain the tone.',
      },
    ],
  },
  {
    title: 'Practice',
    links: [
      {
        title: 'Quiz',
        href: '/quiz',
        description:
          'Self-test on the tarot attributions — intelligence, significance, astrology, and more.',
      },
      {
        title: 'Words of Power',
        href: '/words-of-power',
        description:
          'Hebrew divine names for vibration practice, each with letter-by-letter pronunciation and tones.',
      },
    ],
  },
  {
    title: 'Meditations',
    gated: 'secret',
    links: [
      {
        title: 'Tarot Fundamentals',
        href: '/meditations/tarot-fundamentals',
        description:
          'A 28-day cycle of daily tarot meditations, with rest days every seventh.',
      },
      {
        title: 'Developing Supersensory Powers',
        href: '/meditations/supersensory-powers',
        description:
          'One meditation per major arcana key, drawn from Ann Davies’ Esoteric Extension of Tarot.',
      },
    ],
  },
  {
    title: 'Reference',
    links: [
      {
        title: 'Alchemy',
        href: '/reference/alchemy',
        description:
          'A glossary of alchemical terms — the two Luminaries, the Lions, and the figures of the Great Work.',
      },
      {
        title: 'Astrology',
        href: '/reference/astrology',
        description:
          'The ten planets and twelve signs, each linked to its tarot trump. Cross-references show rulership and exaltation.',
      },
      {
        title: 'Chakras',
        href: '/reference/chakras',
        description:
          'Seven planetary chakras with their presiding archangel, alchemical metal, bodily center, and Church of Revelation.',
      },
      {
        title: 'Elements',
        href: '/reference/elements',
        description:
          'The four classical elements with their symbols, Aristotelian qualities, and physical states.',
      },
      {
        title: 'Grades',
        href: '/reference/grades',
        description:
          'The Golden Dawn grade ladder — each grade tied to a sephirah and a Qabalistic intelligence whose Hebrew letters point to tarot keys.',
      },
      {
        title: 'Numerology',
        href: '/reference/numerology',
        description:
          'The BOTA single-digit numerological keywords — 0 through 9.',
      },
      {
        title: 'Qabalah',
        href: '/reference/qabalah',
        description:
          'Qabalistic reference tables, beginning with the three Veils of Negative Existence — AIN, AIN SOPH, and AIN SOPH AUR.',
      },
      {
        title: 'Tattvas',
        href: '/reference/tattvas',
        description:
          'The five elements as drawn in the Golden Dawn tradition, in 25 nested combinations. Click any to open it full screen.',
      },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        title: 'Files',
        href: '/files',
        description: 'Downloadable wallpapers and other supporting files.',
      },
      {
        title: 'Links',
        href: '/links',
        description: 'Outside resources from the BOTA community.',
      },
      {
        title: 'Radio',
        href: '/ann-davies-radio',
        description:
          'Streaming radio of Ann Davies lectures, embedded from BOTA NZ.',
      },
    ],
  },
  {
    title: 'Website',
    links: [
      {
        title: 'About',
        href: '/about',
        description: 'Who built this and why.',
      },
      {
        title: 'Changelog',
        href: '/changelog',
        description: 'A running list of what’s new and what’s changed on the site.',
      },
      {
        title: 'Settings',
        href: '/settings',
        description:
          'Choose your tarot art style and unlock members only content.',
      },
    ],
  },
]

export const navigation: Array<NavGroup> = [...groups].sort((a, b) =>
  a.title.localeCompare(b.title),
)
