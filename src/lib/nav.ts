export interface NavLink {
  title: string
  href: string
  // Used by the home page TOC cards. Sidebar nav ignores this.
  description?: string
}

export interface NavGroup {
  title: string
  links: Array<NavLink>
}

export const navigation: Array<NavGroup> = [
  {
    title: 'Tarot',
    links: [
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
    title: 'Texts',
    links: [
      {
        title: 'The Pattern on the Trestleboard',
        href: '/texts/pattern-trestleboard',
        description:
          'BOTA’s eleven-statement meditation tracing the descent of Spirit from Kether to Malkuth.',
      },
      {
        title: 'The Emerald Tablet of Hermes',
        href: '/texts/emerald-tablet-hermes',
        description:
          'The foundational hermetic text on the One Thing — short, dense, and famously enigmatic.',
      },
    ],
  },
  {
    title: 'Tools',
    links: [
      {
        title: 'Gematria',
        href: '/gematria',
        description:
          'A Hebrew letter calculator. Tap letters to spell a word; the gematria total updates and the corresponding tarot trumps appear above.',
      },
      {
        title: 'Keyboard',
        href: '/keyboard',
        description:
          'A 12-key chromatic keyboard, one key per simple letter. Press and hold to sustain the tone.',
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
        title: 'About',
        href: '/about',
        description: 'Who built this and why.',
      },
    ],
  },
]
