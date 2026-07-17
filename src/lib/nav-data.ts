// Hand-authored navigation content — the ENGLISH source of truth for
// group/link titles and descriptions. Deliberately dependency-free
// (pure literals): scripts/gen-translations.ts imports it under plain
// node to derive the translatable `nav.*` message keys, so it must not
// pull in webpack-alias imports. Assembly (sorting, visibility, the
// generated Rituals/Texts links, localization) happens in ./nav.ts.

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
  // Stable locale-independent id (kebab-cased ENGLISH title), filled in
  // by nav.ts assembly. Lookups (group pages, breadcrumb group crumb)
  // key on this, never on the possibly-translated title.
  slug?: string
  links: Array<NavLink>
  // Two-tier URL scheme. `flat` groups (Devices, Resources, Website,
  // Utilities) serve each member at a short top-level URL — its `href`,
  // e.g. `/cube-of-space` — *and* a grouped alias (`/devices/cube-of-space`)
  // via a one-line re-export page at app/[locale]/(docs)/<group>/<item>/page.tsx.
  // Every other group is single-URL nested: `href` is the `/<group>/<item>`
  // form (e.g. `/practice/quiz`) with no top-level alias. This keeps the
  // top-level namespace reserved for the flat groups and avoids collisions
  // between the many nested items. content/integrity.ts enforces both the
  // href shape and the existence of each flat group's alias files.
  flat?: true
  // When set, the group is hidden from the sidebar and home TOC unless
  // the user has unlocked secret mode via /settings. The gated
  // routes themselves redirect to /settings if visited directly
  // (see src/app/[locale]/(docs)/meditations/layout.tsx).
  gated?: 'secret'
  // Links are generated from a content manifest (rituals.json /
  // texts.json) — titles/descriptions localize through the data
  // overlays, not the message catalog. `links` stays empty here;
  // nav.ts fills it per locale.
  generated?: 'rituals' | 'texts'
}

// Groups are kept in alphabetical order by title to match how they render
// (nav.ts still sorts, so ordering is never load-bearing — this is just
// to keep source and sidebar in sync). Links within a group keep their
// authored order.
export const navGroups: Array<NavGroup> = [
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
    flat: true,
    links: [
      {
        title: 'Cube of Space',
        href: '/cube-of-space',
        description: 'An interactive 3D Cube of Space.',
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
        description: 'Guided sound and color meditations for the twelve signs.',
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
        href: '/practice/quiz',
        description:
          'Test your knowledge of tarot, astrology, and Hebrew with these quizzes.',
      },
      {
        title: 'Words of Power',
        href: '/practice/words-of-power',
        description:
          'Practice intoning words of power with the associated sound and color.',
      },
    ],
  },
  {
    title: 'Reference',
    links: [
      { title: 'Alchemy', href: '/reference/alchemy' },
      { title: 'Astrology', href: '/reference/astrology' },
      { title: 'Chakras', href: '/reference/chakras' },
      { title: 'Elements', href: '/reference/elements' },
      { title: 'Grades', href: '/reference/grades' },
      { title: 'Hebrew', href: '/reference/hebrew' },
      { title: 'Numerology', href: '/reference/numerology' },
      { title: 'Qabalah', href: '/reference/qabalah' },
      { title: 'Tattvas', href: '/reference/tattvas' },
    ],
  },
  {
    title: 'Resources',
    flat: true,
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
        description: 'Streaming radio of Ann Davies lectures, from BOTA NZ.',
      },
    ],
  },
  {
    // Generated from content/data/rituals.json (order + titles live there).
    title: 'Rituals',
    generated: 'rituals',
    links: [],
  },
  {
    title: 'Tarot',
    links: [
      {
        title: 'Correspondences',
        href: '/tarot/correspondences',
        description: 'See all major arcana attributions from BOTA.',
      },
      {
        title: 'Freeform',
        href: '/tarot/freeform',
        description: 'Draw cards from a deck.',
      },
      {
        title: 'Major Arcana',
        href: '/tarot/major-arcana',
        description: 'A list of all major arcana cards.',
      },
      {
        title: 'Minor Arcana',
        href: '/tarot/minor-arcana',
        description: 'A list of all minor arcana cards.',
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
    generated: 'texts',
    links: [],
  },
  {
    title: 'Utilities',
    flat: true,
    links: [
      {
        title: 'Keyboard',
        href: '/keyboard',
        description: 'A 12-key chromatic keyboard.',
      },
      {
        title: 'Timer',
        href: '/timer',
        description: 'A meditation timer with timed and paced-breath steps.',
      },
    ],
  },
  {
    title: 'Website',
    flat: true,
    links: [
      {
        title: 'About',
        href: '/about',
        description: 'More information about the BOTA Toolbox.',
      },
      {
        title: 'Changelog',
        href: '/changelog',
        description: "View the website's changelog.",
      },
      {
        title: 'Settings',
        href: '/settings',
        description: 'Choose your preferred tarot images and color scheme.',
      },
    ],
  },
]

/** Stable message-key slug for a group ('Cube of Space' → 'cube-of-space'). */
export function navGroupSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-')
}

/**
 * The translatable message keys derived from the hand-authored nav —
 * `nav.group.<slug>.title` plus `nav.<href>.title` / `.description`.
 * Generated groups (Rituals/Texts) contribute only their group title;
 * their links localize through the content overlays instead. Used by
 * the messages module (runtime lookup) and gen-translations (skeleton).
 */
export function navMessageEntries(): Record<string, string> {
  const entries: Record<string, string> = {}
  for (const group of navGroups) {
    entries[`nav.group.${navGroupSlug(group.title)}.title`] = group.title
    for (const link of group.links) {
      entries[`nav.${link.href}.title`] = link.title
      if (link.description) {
        entries[`nav.${link.href}.description`] = link.description
      }
    }
  }
  return entries
}
