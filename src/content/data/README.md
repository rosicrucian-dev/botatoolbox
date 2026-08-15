# Data layer

Two halves, split between the project root and `src/`:

| Path                           | What lives here                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `content/data/<locale>/*.json` | One FULL copy of each language-carrying data file per locale — `en/` is the master (structure is only ever read from it), translated siblings are the same file with display values translated in place. |
| `content/data/*.json`          | Language-free files only (cube-of-space, tree-paths) — no display text, so no locale dirs. |
| `content/data/.schemas/`       | JSON Schema sidecars for VS Code autocomplete — one per file, shared by every locale. **Generated.** |
| `public/data/*.json`           | **Generated** data — built by `npm run gen:*`, fetched on demand. Do **not** edit. |
| `src/content/data/schemas.ts`  | Zod schemas — single source of truth for shape + TS types.                         |
| `src/content/data/<domain>.ts` | Typed view of one or more JSON files + lookup maps + helpers.                      |
| `src/content/data/index.ts`    | Pure barrel — consumers import **only** from `@/content/data`.                     |
| `src/content/data/helpers.ts`  | `byKey<T>()` and other shared utilities.                                           |
| `src/content/integrity.ts`     | Cross-file ref checks (mantraSlug → word, grade.sephirah, …).                      |

## Adding a new data file

1. Add `content/data/<name>.json`.
2. Add `<Name>Schema` to `schemas.ts`.
3. Add a `(file, schema)` entry to `scripts/gen-schemas.ts` and run
   `npm run gen:schemas` (it also regenerates the `.vscode/settings.json`
   editor wiring from that list).
4. Create `src/content/data/<name>.ts` (parse + lookup maps + helpers)
   and add an `export * from './<name>'` line to `index.ts`. The index is
   a pure barrel — it defines nothing itself, and everything outside the
   data layer imports from `@/content/data` only, never from a submodule.
5. If the new file references records in another file, add a check to
   `integrity.ts`. It runs once at boot (imported from `app/layout.tsx`)
   and throws an actionable error on any dangling reference.
6. If the file has human-readable display fields, it lives in
   `content/data/en/<name>.json` instead of top level: register it in
   `overlay-config.ts` (keying + display-field whitelist) and
   `overlays.ts` (the translated-locale imports), then run
   `npm run gen:translations` — that emits the translated siblings
   (e.g. `content/data/de/<name>.json`). The loader then follows the
   localized pattern (see below).

## Translations (full sibling copies, overlay semantics)

Every language-carrying file exists as a FULL copy per locale, all the
same shape — a translator opens `de/tarot.json` and sees exactly what
`en/tarot.json` shows, with values to translate in place. The safety
lives in the merge, not the file shapes: `en/` is the master, and the
runtime reads STRUCTURE exclusively from it. From a translated file it
takes only the display fields whitelisted in `overlay-config.ts`,
matching entries by their stable key — so a translated file's
structural fields are inert context. Editing one warns and is IGNORED
(English wins); a missing or key-broken entry falls back to English
wholesale; nothing a translator does can fail the build.
`npm run gen:translations` is the gardener: rerunning it resyncs every
translated file's structure from English while preserving all
translated display values. Translated-locale JSON is imported in
exactly one place — the registry in `overlays.ts`; loaders import only
their own `en/` master.

Each loader exposes exactly one way to read data — the locale accessor:

```ts
const rawFor = localizedRaw('tarot', data) // overlays come from overlays.ts
export const getTarot = defineLocalized((locale) => {
  const cards = z.array(TarotCardSchema).parse(rawFor(locale))
  …derived views…
  return { cards, cardBySlug, … }
})
```

There are deliberately NO module-level English-pinned exports. Pages pass
`params.locale` (via `toLocale`), client components use `useLocale()`, and
locale-independent consumers (generateStaticParams, integrity.ts, the
sitemap, geometry/layout helpers) call `getTarot(DEFAULT_LOCALE)` — so
"this reads English on purpose" is always explicit at the call site.

Prose markdown translations live at `content/{texts,rituals}/de/<slug>.md`
(same filename as the English source; `readLocalizedMarkdown()` in
`src/content/markdown.ts` falls back to English when absent). The
`gen:translations` script creates any missing skeletons and never
overwrites existing work.

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

Some data is **built**, not hand-written — it lives in `public/data/`
and comes from a `npm run gen:*` script (sources under `scripts/vendor/`).
Don't edit it; edit the source and regenerate. It still gets a Zod schema
in `schemas.ts`, but a large generated file (e.g. `gematria-words.json`)
is validated **once in the generator** rather than `.parse()`'d at
runtime — the data module casts and infers its types from the schema.
These files are large, so they live in `public/` and are **fetched on
demand** (via `fetchGematriaDict`) instead of bundled. The outputs are
committed, so a fresh clone builds without running any generator. See
`public/data/README.md` for the file ↔ generator ↔ source table.

## Prose texts

The markdown texts under `content/texts/en/*.md` (translations as full
parallel copies in sibling locale dirs, e.g. `content/texts/de/`) are listed in
`content/data/texts.json`. Each entry is `{ slug, title }` plus two
opt-in flags. The generic `/texts/[slug]` route renders any entry by
reading its `.md` at build. **Adding a text = a `.md` file + one manifest
line — no code.** Nav and sitemap both derive from this manifest, and
**nav order = array position** in the manifest (there is no `order`
field — insert the entry where it should appear).

- `hidden: true` — out of nav/sitemap, still reachable by direct URL.
- `custom: true` — the text has its own bespoke route folder (a **code**
  task; the generic route deliberately 404s it). Content contributors
  should never set this; it exists for pages like the Trestleboard player.

The slug must exactly match the `.md` filename — integrity checks fail the
build in both directions (manifest entry without a file, or an orphan
`.md` without a manifest entry).

## Rituals

Rituals work the same way: `content/rituals/en/<slug>.md` + one entry in
`content/data/rituals.json`, rendered by the generic `/rituals/[slug]`
route. The markdown is structured: `## Heading` starts a section, a line
like `i. Do the thing` becomes a numbered step (label kept verbatim), and
`[Display](/words-of-power/<id>)` links a word of power (refs are
integrity-checked). Optional manifest fields: `description` (home TOC
card), `musicFileSlug` (reference link to a /files entry), and
`hasPlayer` — set only when a bespoke guided-player route exists at
`/rituals/<slug>/play` (building one is a code task).

## When something is code, not data

- **Quizzes** (`quizzes.ts`) are intentionally code, not JSON: each quiz
  carries per-quiz display transforms that can't cross the RSC
  server→client boundary as plain data. New quizzes are added there.
- **`src/lib` vs here:** data + lookup maps + cross-file refs belong in
  `src/content/data`. Framework/UI/audio utilities (hooks, audio, color
  theming, the gematria _math_ in `lib/gematria.ts`) belong in `src/lib`.
