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
  // This member keeps its OWN namespace instead of nesting under the
  // group's slug — because the namespace names the thing and the group
  // does not (/healing/planets is a healing meditation, filed under
  // Meditations). The integrity check asks for this explicitly rather
  // than letting any href into any group.
  outside?: true
  // Unlisted: hidden from the sidebar, home TOC, and search, but still
  // reachable by direct URL.
  hidden?: boolean
}

export interface RawNavGroup {
  // Stable locale-independent id; also the group landing page's URL
  // segment (/<slug>) and the catalog key segment.
  slug: string
  links: Array<RawNavLink>
  // URL scheme. Members of a `flat` group (devices, library, tools,
  // website) live at a short top-level URL — the `href`, e.g.
  // `/cube-of-space` — with the group page at `/<group>` above them only
  // in the nav, not the URL. Every other group nests: `href` is the
  // `/<group>/<item>` form (e.g. `/practice/quiz`). This keeps the
  // top-level namespace reserved for a few well-known pages and avoids
  // collisions between the many nested items. content/integrity.ts
  // enforces the href shape and that every href has a page.
  flat?: true
}

// THE ORDER HERE IS THE ORDER ON SCREEN, groups and links alike
// (nav.ts no longer sorts). It was alphabetical by slug while nothing
// depended on it; it is authored now, so Practice can stand above
// Meditations. Locale-independent either way — the order is in this
// structure, never in the translated titles.
export const navGroups: Array<RawNavGroup> = [
  {
    // LIBRARY: what is READ and LISTENED TO, a row per shelf and the
    // shelf's own index behind it. The texts were a group with a row
    // per text, generated from content/data/en/texts.json — a list that
    // can only grow, and in time longer than the rest of the sidebar —
    // so /texts is the index now, as /recordings already was. The
    // individual texts stay in the sitemap and the search index, which
    // read the manifest rather than the nav.
    slug: 'library',
    flat: true,
    links: [{ href: '/texts' }, { href: '/recordings' }],
  },
  {
    slug: 'practice',
    links: [{ href: '/practice/quiz' }, { href: '/practice/words-of-power' }],
  },
  {
    // MEDITATIONS: the guided sittings. The planets and the signs were a
    // Healing group of their own and are two more of these — but they
    // keep /healing/, because that is what the practice is called and
    // the pages say so in their own copy ("Healing meditation only
    // covers the 7 classical planets"). Hence `outside`: a member of
    // this group that is not under its slug. /meditations/ cannot take
    // them in any case — it is the private courses' namespace, a course
    // per slug (docs/architecture.md, "Local private pages").
    slug: 'meditations',
    links: [
      { href: '/meditations/pattern-trestleboard' },
      { href: '/healing/planets', outside: true },
      { href: '/healing/signs', outside: true },
    ],
  },
  {
    // REFERENCE: what is LOOKED UP. A row per thing rather than per
    // shelf of things — Correspondences (the tables' own index,
    // src/lib/tables.ts), the two Arcana, the Cube of Space and the
    // Tree of Life. It was eight table rows, and beside it stood
    // a Devices group (the Cube and the Tree) and a Tarot group (four
    // pages, two of them tables), so the same material was spread over
    // three headings by HOW it is drawn instead of by what it is.
    //
    // Flat, because each of these keeps its own top-level namespace:
    // /major-arcana is the tableau and /correspondences/major-arcana is
    // the Keys' table, which is a table and is filed with the tables.
    slug: 'reference',
    flat: true,
    links: [
      { href: '/correspondences' },
      { href: '/major-arcana' },
      { href: '/minor-arcana' },
      { href: '/cube-of-space' },
      { href: '/tree-of-life' },
    ],
  },
  {
    // TOOLS. One row per tool, each row landing on the tool's first
    // view; its other views are tabs of that page, off the sidebar but
    // in the sitemap and the search index (src/lib/tools.ts). Flat,
    // because a tool keeps its own top-level namespace — /gematria is
    // the calculator and /gematria/dictionary is a tab of it — rather
    // than nesting under /tools/.
    slug: 'tools',
    flat: true,
    // Ordered by use, not by name: the chart and the calculator are
    // what this group is opened for, and the draw and the piano stand
    // after them.
    links: [
      { href: '/astrology' },
      { href: '/gematria' },
      { href: '/freeform' },
      { href: '/keyboard' },
    ],
  },
  {
    // The site itself, and what it hands out: the Files and the Links
    // came from a Resources group that held them beside the Radio, and
    // the Radio has gone to the Recordings page, whose stream it is.
    // They are not read or looked up — they are a download and a list of
    // other people's sites, which is as much "about this site" as the
    // About page is.
    slug: 'website',
    flat: true,
    links: [
      { href: '/about' },
      { href: '/community' },
      { href: '/files' },
      { href: '/links' },
      { href: '/settings' },
    ],
  },
]
