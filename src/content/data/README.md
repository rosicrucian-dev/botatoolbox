# Data layer

Two halves, split between the project root and `src/`:

| Path                              | What lives here                                                 |
| --------------------------------- | --------------------------------------------------------------- |
| `content/data/*.json`             | Raw, editable JSON. Hand-editable; non-developers can touch.    |
| `content/data/*.schema.json`      | JSON Schema sidecars for VS Code autocomplete. **Generated.**   |
| `content/data/generated/*.json`   | **Generated** data — built by `npm run gen:*`. Do **not** edit. |
| `src/content/data/schemas.ts`     | Zod schemas — single source of truth for shape + TS types.      |
| `src/content/data/<domain>.ts`    | Typed view of one or more JSON files + lookup maps + helpers.   |
| `src/content/data/index.ts`       | Re-exports everything so consumers import from `@/content/data`.|
| `src/content/data/helpers.ts`     | `byKey<T>()` and other shared utilities.                        |
| `src/content/integrity.ts`        | Cross-file ref checks (mantraSlug → word, grade.sephirah, …).   |

## Adding a new data file

1. Add `content/data/<name>.json`.
2. Add `<Name>Schema` to `schemas.ts`.
3. Add a `(file, schema)` entry to `scripts/gen-schemas.ts` and a
   `fileMatch` entry to `.vscode/settings.json`. Run `npm run gen:schemas`.
4. If the file has its own logic or lookups, create
   `src/content/data/<name>.ts` and re-export from `index.ts`.
   Otherwise add the parse + lookup maps directly in `index.ts`.
5. If the new file references records in another file, add a check to
   `integrity.ts`. It runs once at boot (imported from `app/layout.tsx`)
   and throws an actionable error on any dangling reference.

## Conventions

- **Slugs are kebab-case** and stable URL segments. Renaming a slug
  changes URLs; prefer it only during pre-launch refactors.
- **Lookup maps use `byKey()`** from `helpers.ts`. Duplicate keys throw at
  module load, so typos surface at boot rather than at runtime.
- **Hebrew word shape** — three parallel fields with consistent names:
  - English meaning (e.g. `name: "Beauty"` on a sephirah,
    `intelligenceName: "Mediating"` on a grade)
  - Phonetic Hebrew (e.g. `hebrewName: "Tiphareth"`,
    `intelligenceHebrew: "Shefa Nivdal"`)
  - Letter romanization (e.g. `hebrewRoman: "ThPARTh"`,
    `intelligenceRoman: "ShPO NBDL"`)
  The list of Hebrew letters spelling the word is **never stored** — it's
  derived via `romanToLetters(roman)` in `@/lib/hebrew`. Editing the
  roman string is the only place you change spelling.
- **Reverse maps** (e.g. `gradeBySephirahSlug`) live alongside the
  forward map. Add them when a foreign key is read across multiple pages.
- **Image paths are derived**, never stored. Each card type has a small
  set of helpers (`cardImage`, `thumbImage`, `minorImage`, …) that build
  paths from the slug. Image files are git-LFS through the filter rule
  in `.gitattributes`.

## Generated data

Some data is **built**, not hand-written — it lives in
`content/data/generated/` and comes from a `npm run gen:*` script (sources
under `scripts/vendor/`). Don't edit it; edit the source and regenerate.
It still gets a Zod schema in `schemas.ts`, but a large generated file
(e.g. `gematria-words.json`) is validated **once in the generator** rather
than `.parse()`'d at runtime — the data module casts and infers its types
from the schema. That file is especially large, so it's generated into
`public/` and **fetched on demand** (via `fetchGematriaDict`) instead of
bundled. See `content/data/generated/README.md`.

## Prose texts

The markdown texts under `content/texts/*.md` are listed in
`content/data/texts.json` (slug, title, order; `hidden` to keep it out of
nav/sitemap, `custom` for a text with its own bespoke route). The generic
`/texts/[slug]` route renders any non-`custom` entry by reading its `.md`
at build. **Adding a text = a `.md` file + one manifest line — no code.**
Nav and sitemap both derive from this manifest.

## When something is code, not data

- **Quizzes** (`quizzes.ts`) are intentionally code, not JSON: each quiz
  carries per-quiz display transforms that can't cross the RSC
  server→client boundary as plain data. New quizzes are added there.
- **`src/lib` vs here:** data + lookup maps + cross-file refs belong in
  `src/content/data`. Framework/UI/audio utilities (hooks, audio, color
  theming, the gematria *math* in `lib/gematria.ts`) belong in `src/lib`.
