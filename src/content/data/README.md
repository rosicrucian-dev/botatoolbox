# Data layer

Two halves, split between the project root and `src/`:

| Path                              | What lives here                                                 |
| --------------------------------- | --------------------------------------------------------------- |
| `content/data/*.json`             | Raw, editable JSON. Hand-editable; non-developers can touch.    |
| `content/data/*.schema.json`      | JSON Schema sidecars for VS Code autocomplete. **Generated.**   |
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
