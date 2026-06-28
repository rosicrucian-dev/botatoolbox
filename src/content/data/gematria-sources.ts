// The gematria dictionary's sources, in display order. This registry is the
// single source of truth for what sources exist, how they're labeled, and the
// order they render in — top to bottom. Nothing is merged across sources: each
// number lists every source's take on it independently.
//
// Two shapes of source:
//   - 'note'  — keyed by the NUMBER. One prose block (no Hebrew headword).
//               Paul Case's number-keyed dictionaries.
//   - 'words' — keyed by the number too, but a LIST of Hebrew words, each with
//               one or more definitions. Crowley (one curated gloss per word)
//               and Strong's (every sense of every spelling at the value).
//
// Adding a source is a one-liner here plus its data (a JSON file for notes; a
// vendored lexicon for words) — the generator and both gematria pages iterate
// this list, so no schema or UI change is needed.
//
// Dependency-free on purpose: imported by the runtime (via the @/ alias) AND by
// scripts/build-gematria-words.ts (relative path, under --experimental-strip-
// types), so it must stay plain data with no framework imports.

export type GematriaSourceId =
  | 'case-fundamentals'
  | 'case-notebook'
  | 'crowley'
  | 'strongs'

export type GematriaSourceKind = 'note' | 'words'

export interface GematriaSource {
  id: GematriaSourceId
  label: string
  kind: GematriaSourceKind
  // 'note' sources whose text is too large to ship inside the core dictionary
  // are written to their own static file (public/data/gematria-note-<id>.json)
  // and fetched lazily, merged into the dictionary client-side once they load.
  external?: boolean
  // Kept in the data pipeline but not shown on the gematria pages (and not
  // fetched). Used to park a source whose presentation isn't ready yet.
  hidden?: boolean
}

export const GEMATRIA_SOURCES: ReadonlyArray<GematriaSource> = [
  {
    id: 'case-fundamentals',
    label: 'Paul Case',
    kind: 'note',
  },
  {
    id: 'case-notebook',
    label: 'Paul Case — Gematria Notebook',
    kind: 'note',
    external: true,
    // Hidden for now — the notebook text isn't well formatted yet. Data is
    // still generated; flip this off to re-enable on the pages.
    hidden: true,
  },
  { id: 'crowley', label: 'Crowley', kind: 'words' },
  { id: 'strongs', label: "Strong's", kind: 'words' },
]

// The sources actually shown on the gematria pages, in order.
export const VISIBLE_GEMATRIA_SOURCES: ReadonlyArray<GematriaSource> =
  GEMATRIA_SOURCES.filter((s) => !s.hidden)

// The static-file URL for an external 'note' source.
export function gematriaNoteUrl(id: GematriaSourceId): string {
  return `/data/gematria-note-${id}.json`
}
