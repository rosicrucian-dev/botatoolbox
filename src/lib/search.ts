// Static search index: every nav-listed page, every tool view behind a
// tab, every text, plus the detail pages — tarot cards, words of power,
// sephiroth, signs, planets. Titles
// only; matching is a case-insensitive substring, which is all ~250 short
// strings need. Because the entries come straight from the data layer,
// newly contributed content is searchable with no code change.
// Built per locale so translated titles are searchable on /de.

import {
  getAstrology,
  getMinorArcana,
  getSephiroth,
  getTarot,
  getTexts,
  getWords,
} from '@/content/data'
import { defineLocalized } from '@/content/data/localized'
import { getNavigation, localizedTitle } from '@/lib/nav'
import { getTables } from '@/lib/tables'
import { TOOL_TABS } from '@/lib/tools'

export interface SearchEntry {
  url: string
  title: string
}

export const getSearchEntries = defineLocalized(
  (locale): ReadonlyArray<SearchEntry> => {
    const { cards } = getTarot(locale)
    const { minorCards } = getMinorArcana(locale)
    const { words } = getWords(locale)
    const { sephiroth } = getSephiroth(locale)
    const { astrologySigns, astrologyPlanets } = getAstrology(locale)
    const { visibleTexts } = getTexts(locale)
    return [
      { url: '/', title: 'BOTA Toolbox' },
      ...getNavigation(locale).flatMap((group) =>
        group.links
          .filter((l) => !l.hidden)
          .map((l) => ({ url: l.href, title: l.title })),
      ),
      // The texts have no nav row of their own either: the Library
      // lists /texts and the index lists them (src/lib/navData.ts).
      ...visibleTexts.map((t) => ({ url: `/texts/${t.slug}`, title: t.title })),
      // Nor do the correspondence tables: the Reference lists
      // /correspondences and that index lists them (src/lib/tables.ts).
      ...getTables(locale).map((t) => ({ url: t.href, title: t.title })),
      // The Radio has no nav row either: it is a link at the top of the
      // Recordings page (src/lib/navData.ts).
      { url: '/radio', title: localizedTitle(locale, 'Radio') },
      // A tool's other views have no nav row of their own (the tool
      // has one row), so they are added here — a page a reader can
      // reach by tab and not by search would be a page they can't find.
      ...TOOL_TABS.map((tab) => ({
        url: tab.href,
        title: localizedTitle(locale, tab.label),
      })),
      ...cards.map((c) => ({ url: `/tarot/${c.slug}`, title: c.name })),
      ...minorCards.map((c) => ({
        url: `/tarot/${c.slug}`,
        title: `${c.num} of ${c.suit}`,
      })),
      ...words.map((w) => ({
        url: `/words-of-power/${w.slug}`,
        title: w.name,
      })),
      ...sephiroth.map((s) => ({
        url: `/tree-of-life/${s.slug}`,
        title: `${s.hebrewName} — ${s.name}`,
      })),
      ...astrologySigns.map((s) => ({
        url: `/correspondences/astrology/signs/${s.slug}`,
        title: s.name,
      })),
      ...astrologyPlanets.map((p) => ({
        url: `/correspondences/astrology/planets/${p.slug}`,
        title: p.name,
      })),
    ]
  },
)

// Case-insensitive substring match; earlier matches (prefixes) rank
// first, shorter titles break ties.
//
// DELIBERATELY NOT @rosicrucian/search, though it would unify this with
// the collection dialog. For ~250 short names a prebuilt index buys nothing,
// and substring matching is the right matcher for them: typing "2 of" should
// narrow to "2 of Cups" … "2 of Wands" as it is typed, which a word-based
// engine only does once the word is complete. (The engine's tokenizer keeps
// digits since the 2026-10 redesign, so the old reason — "2 of Cups" and "10
// of Cups" collapsing to the one token `cups` — no longer applies; this is
// now a choice about fit, not a workaround.)
export function searchTitles(
  query: string,
  limit: number,
  entries: ReadonlyArray<SearchEntry>,
): Array<SearchEntry> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored: Array<[number, SearchEntry]> = []
  for (const entry of entries) {
    const at = entry.title.toLowerCase().indexOf(q)
    if (at !== -1) scored.push([at, entry])
  }
  return scored
    .sort((a, b) => a[0] - b[0] || a[1].title.length - b[1].title.length)
    .slice(0, limit)
    .map(([, entry]) => entry)
}
