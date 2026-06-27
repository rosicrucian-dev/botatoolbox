import { visibleTexts } from '@/content/data/texts'

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
  // the user has unlocked secret mode via /members-only. The gated
  // routes themselves redirect to /members-only if visited directly
  // (see src/app/(docs)/meditations/layout.tsx).
  gated?: 'secret'
}

export const navigation: Array<NavGroup> = [
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
        title: 'Tableau',
        href: '/tarot/tableau',
        description:
          'The major arcana arranged in BOTA’s standard tableau pattern.',
      },
      {
        title: 'Major Arcana',
        href: '/tarot/major-arcana',
        description:
          'The 22 trumps in numerical order.',
      },
      {
        title: 'Minor Arcana',
        href: '/tarot/minor-arcana',
        description:
          'Keywords for the 40 numbered cards across Wands, Cups, Swords, and Pentacles.',
      },
      {
        title: 'Random Pull',
        href: '/tarot/random-pull',
        description:
          'Draw random cards from the major arcana — one at a time, as many as you like.',
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
    title: 'Rituals',
    links: [
      {
        title: 'The Lesser Ritual of the Pentagram',
        href: '/rituals/lrp',
        description:
          'A guided walkthrough of the LRP — Qabalistic Cross, the four Pentagrams with their divine names, and the closing Cross.',
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
    })),
  },
  {
    title: 'Gematria',
    links: [
      {
        title: 'Calculator',
        href: '/gematria',
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
    title: 'Utilities',
    links: [
      {
        title: 'Keyboard',
        href: '/keyboard',
        description:
          'A 12-key chromatic keyboard, one key per simple letter. Press and hold to sustain the tone.',
      },
      {
        title: 'Quiz',
        href: '/quiz',
        description:
          'Self-test on the tarot attributions — intelligence, significance, astrology, and more.',
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
        title: 'Astrology',
        href: '/astrology',
        description:
          'The ten planets and twelve signs, each linked to its tarot trump. Cross-references show rulership and exaltation.',
      },
      {
        title: 'Chakras',
        href: '/chakras',
        description:
          'Seven planetary chakras with their presiding archangel, alchemical metal, and bodily center.',
      },
      {
        title: 'Grades',
        href: '/grades',
        description:
          'The Golden Dawn grade ladder — each grade tied to a sephirah and a Qabalistic intelligence whose Hebrew letters point to tarot keys.',
      },
      {
        title: 'Numerology',
        href: '/numerology',
        description:
          'The BOTA single-digit numerological keywords — 0 through 9.',
      },
      {
        title: 'Tattvas',
        href: '/tattvas',
        description:
          'The five elements as drawn in the Golden Dawn tradition, in 25 nested combinations. Click any to open it full screen.',
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
    title: 'Resources',
    links: [
      {
        title: 'About',
        href: '/about',
        description: 'Who built this and why.',
      },
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
        title: 'Members Only',
        href: '/members-only',
        description: 'Enter a password to unlock members only content.',
      },
    ],
  },
]
