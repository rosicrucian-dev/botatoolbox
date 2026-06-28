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
}

export const GEMATRIA_SOURCES: ReadonlyArray<GematriaSource> = [
  {
    id: 'case-fundamentals',
    label: 'Paul Case — Occult Fundamentals',
    kind: 'note',
  },
  { id: 'case-notebook', label: 'Paul Case — Gematria Notebook', kind: 'note' },
  { id: 'crowley', label: 'Crowley', kind: 'words' },
  { id: 'strongs', label: "Strong's", kind: 'words' },
]
