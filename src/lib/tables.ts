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
// `nav.<href>.title` keys they always had, so the
// German catalog keeps working and nothing was retyped into code.
//
// THE SET IS THE HERMETIC ORDER OF AQUARIUS'S (10 November 2026). The
// two sites carry the same reference, so the tables, their columns and
// their groups match, and that site adds a quiz to each on top. What
// does NOT match is the chrome and the tools: these tables are built
// from Catalyst, and the twenty-five tattva compounds are playable here
// and printed there.
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
  // THE ALCHEMY GROUP IS A LADDER, and the four are the titles of
  // School of Ageless Wisdom Section A lessons 2, 3, 4 and 5: 3, 5, 7
  // and 12, which is the Sepher Yetzirah's own count once the five
  // phases are set beside the three, the seven and the twelve.
  { href: '/correspondences/principles', group: 'Alchemy' },
  { href: '/correspondences/phases', group: 'Alchemy' },
  { href: '/correspondences/forces', group: 'Alchemy' },
  { href: '/correspondences/channels', group: 'Alchemy' },
  // GRADES IS A QABALAH TABLE and stands next to the Sephiroth: the
  // ladder from 1=10 to 10=1 IS the Sephiroth counted from the bottom,
  // and each grade's Intelligence is the Sepher Yetzirah's name for its
  // Sephirah, so three of its four columns are the Tree's.
  { href: '/correspondences/sephiroth', group: 'Qabalah' },
  { href: '/correspondences/grades', group: 'Qabalah' },
  { href: '/correspondences/three-veils', group: 'Qabalah' },
  { href: '/correspondences/four-worlds', group: 'Qabalah' },
  { href: '/correspondences/signs', group: 'Astrology' },
  { href: '/correspondences/planets', group: 'Astrology' },
  { href: '/correspondences/houses', group: 'Astrology' },
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
  group: TableGroup
}

export const getTables = defineLocalized(
  (locale): ReadonlyArray<Table> =>
    tables.map((table) => ({
      ...table,
      title: tKey(locale, `nav.${table.href}.title`)!,
    })),
)

/** The tables under each heading, headings with none dropped. */
export const getTableGroups = defineLocalized((locale) =>
  TABLE_GROUPS.map((group) => ({
    group,
    tables: getTables(locale).filter((t) => t.group === group),
  })).filter((g) => g.tables.length > 0),
)
