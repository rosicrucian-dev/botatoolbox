// Static search index: every (non-gated) nav-listed page plus the detail
// pages — tarot cards, words of power, sephiroth, signs, planets. Titles
// only; matching is a case-insensitive substring, which is all ~250 short
// strings need. Because the nav itself derives from the content manifests
// (texts, rituals) and the detail entries come straight from the data
// layer, newly contributed content is searchable with no code change.

import {
  astrologyPlanets,
  astrologySigns,
  cards,
  minorCards,
  sephiroth,
  words,
} from '@/content/data'
import { navigation } from '@/lib/nav'

export interface SearchEntry {
  url: string
  title: string
}

export const searchEntries: ReadonlyArray<SearchEntry> = [
  { url: '/', title: 'BOTA Toolbox' },
  ...navigation
    .filter((group) => !group.gated)
    .flatMap((group) =>
      group.links.map((l) => ({ url: l.href, title: l.title })),
    ),
  ...cards.map((c) => ({ url: `/tarot/${c.slug}`, title: c.name })),
  ...minorCards.map((c) => ({
    url: `/tarot/${c.slug}`,
    title: `${c.num} of ${c.suit}`,
  })),
  ...words.map((w) => ({ url: `/words-of-power/${w.slug}`, title: w.name })),
  ...sephiroth.map((s) => ({
    url: `/tree-of-life/${s.slug}`,
    title: `${s.hebrewName} — ${s.name}`,
  })),
  ...astrologySigns.map((s) => ({
    url: `/reference/astrology/signs/${s.slug}`,
    title: s.name,
  })),
  ...astrologyPlanets.map((p) => ({
    url: `/reference/astrology/planets/${p.slug}`,
    title: p.name,
  })),
]

// Case-insensitive substring match; earlier matches (prefixes) rank
// first, shorter titles break ties.
export function searchTitles(query: string, limit = 8): Array<SearchEntry> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored: Array<[number, SearchEntry]> = []
  for (const entry of searchEntries) {
    const at = entry.title.toLowerCase().indexOf(q)
    if (at !== -1) scored.push([at, entry])
  }
  return scored
    .sort((a, b) => a[0] - b[0] || a[1].title.length - b[1].title.length)
    .slice(0, limit)
    .map(([, entry]) => entry)
}
