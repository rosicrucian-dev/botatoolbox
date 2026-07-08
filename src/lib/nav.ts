import { visibleRituals, visibleTexts } from '@/content/data'

export interface NavLink {
  title: string
  href: string
  // Used by the home page TOC cards. Sidebar nav ignores this.
  description?: string
  // Unlisted: hidden from the sidebar, home TOC, and search, but still
  // reachable by direct URL. Unlike the group-level `gated: 'secret'`,
  // this isn't tied to any unlock — the page is simply not advertised.
  hidden?: boolean
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

// Groups are kept in alphabetical order by title to match how they render
// (the export below still sorts, so ordering is never load-bearing — this
// is just to keep source and sidebar in sync). Links within a group keep
// their authored order.
const groups: Array<NavGroup> = [
  {
    title: 'Astrology',
    links: [
      {
        title: 'Chart',
        href: '/astrology/chart',
        description:
          'The current positions of the planets on the zodiac wheel, with a list of transit aspects.',
      },
      {
        title: 'Hora',
        href: '/astrology/hora',
        description:
          'Planetary hours computed for your location — the ruling planet of the current hour, and the hours ahead.',
        hidden: true,
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
          'An interactive 3D Cube of Space.',
      },
      {
        title: 'Tree of Life',
        href: '/tree-of-life',
        description:
          'A representation of the Tree of Life with the ten sephiroth and twenty-two paths of wisdom.',
      },
    ],
  },
  {
    title: 'Gematria',
    links: [
      {
        title: 'Calculator',
        href: '/gematria/calculator',
        description:
          'Tap Hebrew letters to spell a word and compute its gematria value.',
      },
      {
        title: 'Dictionary',
        href: '/gematria/dictionary',
        description:
          'Enter a number to see the Hebrew words sharing its gematria value, with notes from Paul Case.',
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
          'Guided sound and color meditations for the seven planets.',
      },
      {
        title: 'Signs',
        href: '/healing/signs',
        description:
          'Guided sound and color meditations for the twelve signs.',
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
    title: 'Practice',
    links: [
      {
        title: 'Quiz',
        href: '/quiz',
        description:
          'Test your knowledge of tarot, astrology, and Hebrew with these quizzes.',
      },
      {
        title: 'Words of Power',
        href: '/words-of-power',
        description:
          'Practice intoning words of power with the associated sound and color.',
      },
    ],
  },
  {
    title: 'Reference',
    links: [
      {
        title: 'Alchemy',
        href: '/reference/alchemy',
      },
      {
        title: 'Astrology',
        href: '/reference/astrology',
      },
      {
        title: 'Chakras',
        href: '/reference/chakras',
      },
      {
        title: 'Elements',
        href: '/reference/elements',
      },
      {
        title: 'Grades',
        href: '/reference/grades',
      },
      {
        title: 'Hebrew',
        href: '/reference/hebrew',
      },
      {
        title: 'Numerology',
        href: '/reference/numerology',
      },
      {
        title: 'Qabalah',
        href: '/reference/qabalah',
      },
      {
        title: 'Tattvas',
        href: '/reference/tattvas',
      },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        title: 'Files',
        href: '/files',
        description: 'Downloadable files and historical documents.',
      },
      {
        title: 'Links',
        href: '/links',
        description: 'Other resources from the BOTA community.',
      },
      {
        title: 'Radio',
        href: '/radio',
        description:
          'Streaming radio of Ann Davies lectures, from BOTA NZ.',
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
    title: 'Tarot',
    links: [
      {
        title: 'Correspondences',
        href: '/tarot/correspondences',
        description:
          'See all major arcana attributions from BOTA.',
      },
      {
        title: 'Freeform',
        href: '/tarot/freeform',
        description:
          'Draw cards from a deck.',
      },
      {
        title: 'Major Arcana',
        href: '/tarot/major-arcana',
        description: 'A list of all major arcana cards.',
      },
      {
        title: 'Minor Arcana',
        href: '/tarot/minor-arcana',
        description:
          'A list of all minor arcana cards.',
      },
      {
        title: 'Tableau',
        href: '/tarot/tableau',
        description:
          'The major arcana arranged in the standard tableau pattern.',
      },
    ],
  },
  {
    // Generated from content/data/texts.json (order + titles live there).
    // Hidden texts — e.g. Chaldean Oracles — are excluded via visibleTexts
    // but stay reachable by direct URL.
    title: 'Texts',
    links: visibleTexts.map((t) => ({
      title: t.title,
      href: `/texts/${t.slug}`,
      description: t.description,
    })),
  },
  {
    title: 'Utilities',
    links: [
      {
        title: 'Keyboard',
        href: '/keyboard',
        description:
          'A 12-key chromatic keyboard.',
      },
    ],
  },
  {
    title: 'Website',
    links: [
      {
        title: 'About',
        href: '/about',
        description: 'More information about the BOTA Toolbox.',
      },
      {
        title: 'Changelog',
        href: '/changelog',
        description: 'View the website\'s changelog.',
      },
      {
        title: 'Settings',
        href: '/settings',
        description:
          'Choose your preferred tarot images and color scheme.',
      },
    ],
  },
]

export const navigation: Array<NavGroup> = [...groups].sort((a, b) =>
  a.title.localeCompare(b.title),
)

// Sidebar + home TOC view: the same groups with `hidden` links removed,
// and any group left empty dropped. Consumers that render the visible
// nav use this; search and the sitemap keep working off `navigation`
// (search does its own `hidden` filtering). Filtering here — rather than
// at each render site — keeps the sidebar's active-marker offset math,
// which indexes into `group.links`, aligned with what's actually shown.
export const visibleNavigation: Array<NavGroup> = navigation
  .map((group) => ({
    ...group,
    links: group.links.filter((link) => !link.hidden),
  }))
  .filter((group) => group.links.length > 0)
