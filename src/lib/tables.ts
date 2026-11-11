// THE CORRESPONDENCE TABLES, and the one list that orders them. They
// were eight sidebar rows under Reference, and the Reference is five
// rows now (Correspondences, Major Arcana, Minor Arcana, Cube of Space,
// Tree of Life) — so the tables live behind /correspondences, which is
// their index, and a table is no longer a nav link.
//
// That is why this file exists. A page with no nav row needs its title
// and its place from somewhere, and for the tables that somewhere is
// here: the STRUCTURE (which table, under which heading, in what order)
// is below, and the STRINGS stay in the message catalog under the same
// `nav.<href>.title` / `.description` keys they always had, so the
// German catalog keeps working and nothing was retyped into code.
//
// Read by the index (/correspondences) and by the search index. The
// module-load assertion below is the nav's own, for the same reason:
// a missing title should be a loud build failure, not a blank card.

import { defineLocalized } from '@/content/data/localized'
import { en as messages, tKey } from '@/content/messages'

// The headings, in the order the index prints them. `Tables` is the
// CATCH-ALL and is last: a table stands there until its subject has
// several of its own, and it is the heading a reader scans past rather
// than one they come looking for.
export const TABLE_GROUPS = [
  'Tarot',
  'Languages',
  'Alchemy',
  'Qabalah',
  'Astrology',
  'Tables',
] as const

export type TableGroup = (typeof TABLE_GROUPS)[number]

export interface RawTable {
  href: string
  group: TableGroup
}

export const tables: ReadonlyArray<RawTable> = [
  { href: '/correspondences/major-arcana', group: 'Tarot' },
  { href: '/correspondences/minor-arcana', group: 'Tarot' },
  { href: '/correspondences/hebrew', group: 'Languages' },
  { href: '/correspondences/elements', group: 'Alchemy' },
  { href: '/correspondences/tattvas', group: 'Alchemy' },
  { href: '/correspondences/qabalah', group: 'Qabalah' },
  { href: '/correspondences/grades', group: 'Qabalah' },
  { href: '/correspondences/astrology', group: 'Astrology' },
  { href: '/correspondences/chakras', group: 'Tables' },
  { href: '/correspondences/numerology', group: 'Tables' },
]

for (const table of tables) {
  if (messages[`nav.${table.href}.title`] === undefined) {
    throw new Error(
      `tables: missing "nav.${table.href}.title" in content/messages/en.json`,
    )
  }
}

export interface Table {
  href: string
  title: string
  description?: string
  group: TableGroup
}

export const getTables = defineLocalized(
  (locale): ReadonlyArray<Table> =>
    tables.map((table) => ({
      ...table,
      title: tKey(locale, `nav.${table.href}.title`)!,
      description: tKey(locale, `nav.${table.href}.description`),
    })),
)

/** The tables under each heading, headings with none dropped. */
export const getTableGroups = defineLocalized((locale) =>
  TABLE_GROUPS.map((group) => ({
    group,
    tables: getTables(locale).filter((t) => t.group === group),
  })).filter((g) => g.tables.length > 0),
)
