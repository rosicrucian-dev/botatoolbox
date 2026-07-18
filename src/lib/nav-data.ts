// Hand-authored navigation STRUCTURE — hrefs, grouping, flags. Display
// strings (group titles, link titles/descriptions) live in the message
// catalog (content/messages/en.json) under keys derived from the slugs
// and hrefs here: `nav.group.<slug>.title`, `nav.<href>.title`,
// `nav.<href>.description`. Assembly + localization + the assertion
// that every entry has its catalog keys happen in ./nav.ts.
//
// Deliberately dependency-free (pure literals): the generator scripts
// import this under plain node, so it must not pull in webpack-alias
// imports.

export interface RawNavLink {
  href: string
  // Unlisted: hidden from the sidebar, home TOC, and search, but still
  // reachable by direct URL. Unlike the group-level `gated: 'secret'`,
  // this isn't tied to any unlock — the page is simply not advertised.
  hidden?: boolean
}

export interface RawNavGroup {
  // Stable locale-independent id; also the group landing page's URL
  // segment (/<slug>) and the catalog key segment.
  slug: string
  links: Array<RawNavLink>
  // Two-tier URL scheme. `flat` groups (devices, resources, website,
  // utilities) serve each member at a short top-level URL — its `href`,
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
  // texts.json) — titles/descriptions localize through the data files,
  // not the message catalog. `links` stays empty here; nav.ts fills it
  // per locale.
  generated?: 'rituals' | 'texts'
}

// Groups are kept in alphabetical order by slug to match how they
// render (nav.ts sorts by slug, so ordering is never load-bearing —
// this is just to keep source and sidebar in sync). Links within a
// group keep their authored order.
export const navGroups: Array<RawNavGroup> = [
  {
    slug: 'astrology',
    links: [
      { href: '/astrology/chart' },
      { href: '/astrology/hora', hidden: true },
    ],
  },
  {
    slug: 'devices',
    flat: true,
    links: [{ href: '/cube-of-space' }, { href: '/tree-of-life' }],
  },
  {
    slug: 'gematria',
    links: [{ href: '/gematria/calculator' }, { href: '/gematria/dictionary' }],
  },
  {
    slug: 'healing',
    links: [{ href: '/healing/planets' }, { href: '/healing/signs' }],
  },
  {
    slug: 'meditations',
    gated: 'secret',
    links: [
      { href: '/meditations/tarot-fundamentals' },
      { href: '/meditations/supersensory-powers' },
    ],
  },
  {
    slug: 'practice',
    links: [{ href: '/practice/quiz' }, { href: '/practice/words-of-power' }],
  },
  {
    slug: 'reference',
    links: [
      { href: '/reference/alchemy' },
      { href: '/reference/astrology' },
      { href: '/reference/chakras' },
      { href: '/reference/elements' },
      { href: '/reference/grades' },
      { href: '/reference/hebrew' },
      { href: '/reference/numerology' },
      { href: '/reference/qabalah' },
      { href: '/reference/tattvas' },
    ],
  },
  {
    slug: 'resources',
    flat: true,
    links: [{ href: '/files' }, { href: '/links' }, { href: '/radio' }],
  },
  {
    // Generated from content/data/en/rituals.json (order + titles live there).
    slug: 'rituals',
    generated: 'rituals',
    links: [],
  },
  {
    slug: 'tarot',
    links: [
      { href: '/tarot/correspondences' },
      { href: '/tarot/freeform' },
      { href: '/tarot/major-arcana' },
      { href: '/tarot/minor-arcana' },
      { href: '/tarot/tableau' },
    ],
  },
  {
    // Generated from content/data/en/texts.json (order + titles live there).
    // Hidden texts — e.g. Chaldean Oracles — are excluded via visibleTexts
    // but stay reachable by direct URL.
    slug: 'texts',
    generated: 'texts',
    links: [],
  },
  {
    slug: 'utilities',
    flat: true,
    links: [{ href: '/keyboard' }, { href: '/timer' }],
  },
  {
    slug: 'website',
    flat: true,
    links: [{ href: '/about' }, { href: '/changelog' }, { href: '/settings' }],
  },
]
