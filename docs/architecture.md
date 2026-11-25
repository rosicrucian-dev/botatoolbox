# Architecture

BOTA Toolbox is a Next.js 16 App Router site built as a **static export**
and deployed to GitHub Pages. There is no server at runtime: every page is
HTML generated at build time from JSON and markdown in `content/`, plus a
service worker that makes the whole site work offline as an installed PWA.

This document is the map. Each area has deeper notes in the file headers
of the code it describes; the data layer has its own guide at
[`src/content/data/README.md`](../src/content/data/README.md).

## Repository map

| Path              | What it is                                                                              |
| ----------------- | --------------------------------------------------------------------------------------- |
| `content/`        | Editable source content: JSON data per locale, markdown texts, message catalogs.        |
| `src/app/`        | Routes. Everything lives under `[locale]/`, split into `(docs)` and `(player)` groups.  |
| `src/components/` | Shared React components, grouped by area (see below). `catalyst/` is vendored UI.       |
| `src/content/`    | The typed data layer: Zod schemas, loaders, locale merge, integrity checks.             |
| `src/lib/`        | Framework-free code: `hooks/`, `stores/`, `audio/`, `astro/`, plus root modules.        |
| `src/styles/`     | The single Tailwind 4 stylesheet. `typography.ts` at the repo root is its prose config. |
| `scripts/`        | Build steps and generators (see the table below). `vendor/` holds source data.          |
| `public/`         | Static assets. `public/data/` is generated, never hand-edited.                          |
| `test/`           | Node test-runner tests (`npm test`). `hooks.ts` resolves the app's path aliases.        |
| `docs/`           | This folder.                                                                            |

### Where shared code lives

`src/components/` is split by area so a newcomer can find the neighbours of
any file:

| Folder                                                                  | Holds                                                                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `layout/`                                                               | The app shell: `Layout`, `Header`, `Footer`, `Logo`, page headings and toolbars, gates, the service-worker registration. |
| `ui/`                                                                   | Generic primitives: `Prose`, `Tabs`, `TextLink`, lists, patterns, `ErrorFallback`, `InlineCombobox`.                     |
| `nav/`                                                                  | Sidebar and mobile navigation, `NavProvider`, breadcrumbs, prev/next links and gestures, home-page cards and pins.       |
| `locale/`                                                               | `LocaleLink` (every internal link), `LocaleProvider`, the language switcher.                                             |
| `search/`                                                               | The two search dialogs and their shared `SearchDialogShell`.                                                             |
| `player/`                                                               | `SlidePlayer`, `TranscriptPlayer`, the recording player and their controls.                                              |
| `gematria/` `tarot/` `astrology/` `cube/` `tree/` `keyboard/` `tattva/` | Feature widgets for one domain each.                                                                                     |
| `catalyst/`                                                             | Vendored Tailwind Catalyst; see its README.                                                                              |

`src/lib/` keeps most modules at its root, with three groupings:
`hooks/` (every `useX` hook), `stores/` (persisted preferences, all built
on `createPersistedStore` in `stores/persisted.ts`) and `audio/`.
`astro/` is the astrology engine. Full-text search comes from the
`@rosicrucian/search` package (see Search below); `collectionSearch.ts` is the
project-local adapter over it.

## Build pipeline

```
npm run dev        next dev --webpack   (no export, on-demand rendering)

npm run build      prebuild   → gen:search   writes public/data/recordings-search.json + snippets
                   build      → next build   static export to out/en/, out/de/
                   postbuild  → hoist:en     moves out/en/* to out/ so English is unprefixed
                              → gen:sw       generates out/sw.js with a precache manifest
```

- **`npm run build` and the dev server share `.next/`.** Running a build
  while `npm run dev` is up breaks the dev server until it restarts. Use
  `npx tsc --noEmit` for everyday verification, and `npm run verify:build`
  (which writes to `.next-verify/`) when you need a real build: new routes,
  integrity checks, RSC boundary errors, `generateStaticParams`.
- Search indexes under `public/data/*-search*.json` are **gitignored build
  artifacts**, regenerated on every build. A fresh clone needs one
  `npm run gen:search` before dev-server search works.
- `src/content/integrity.ts` exports `runIntegrityChecks()`. The root
  layout calls it, so every dev boot and every build runs the cross-file
  reference checks and fails loudly on a dangling reference; `npm test`
  calls it too, so a content mistake fails in seconds without a build.
- CI (`.github/workflows/ci.yml`) runs typecheck, tests, `check:schemas`,
  and a full build on every PR. `deploy.yml` builds and
  publishes `out/` on push to `main`.

## Routing and locales

Every route sits under `src/app/[locale]/`. The `[locale]` layout owns the
`<html lang>` element and enumerates `LOCALES` from `src/lib/locales.ts`
with `dynamicParams = false`, so only real locales build.

- **English is served unprefixed** (`/tarot/`), German under `/de/tarot/`.
  The build emits English at `out/en/`; `scripts/hoist-en.ts` moves it to
  the root after the build. In dev, a fallback rewrite in `next.config.mjs`
  maps unprefixed paths to `/en/` so both environments share the same URL
  shape.
- **All internal links go through `src/components/locale/LocaleLink.tsx`**
  (`Link`, `PlainLink`, `useLocaleRouter`, `useLocaleTransitionRouter`).
  Raw `next/link`, the `next-view-transitions` Link, and `useRouter` from
  `next/navigation` are banned by ESLint because they drop the `/de/`
  prefix. `Link` uses view transitions (docs pages); `PlainLink` does not
  (players, where the iOS toolbar priming must not be disturbed).
- **Unreleased locales.** `UNRELEASED_LOCALES` in `src/lib/locales.ts`
  hides a locale from the switcher, settings, and sitemap while it is
  still being translated, and marks every page of it `noindex`. `de` is
  currently an English placeholder.

### Route groups

- `(docs)` wraps pages in the navigation chrome (`NavProvider` + `Layout`)
  and has its own `error.tsx`.
- `(player)` is chrome-free for full-screen experiences. Every `/play`,
  `/expand`, and `/focus` route lives here, plus the quiz player.

### Page conventions

A page is a server component that awaits `params`, narrows the locale with
`toLocale()`, loads data from `@/content/data`, and for dynamic routes
exports `generateStaticParams` enumerated from `DEFAULT_LOCALE`.
Interactive parts are handed to a colocated client component. A page whose
title mirrors its nav entry exports
`generateMetadata = localizedMetadata('Keyboard', '/keyboard')` from
`@/lib/nav`; pages whose title comes from data write their own
`generateMetadata`. Either way the page names its own path, for its
canonical URL (see Search engines below).

**Colocation rule:** a component used by exactly one route lives next to
that route's `page.tsx`, named `*Client.tsx` when it is `'use client'`.
A component used by two or more routes lives in `src/components/`.

### URL scheme and the nav as source of truth

`src/lib/navData.ts` is the hand-authored list of groups and links — every
one of them hand-authored now; the Texts group used to generate its rows
from `texts.json` and is a single Library row to the `/texts` index
instead, so a collection's items are listed on its own index page and
reach the sitemap and search from the manifest, never from the nav. Members
of a `flat` group (library, reference, tools, website) live at a
top-level URL (`/cube-of-space`); every other group's members nest under
it (`/practice/quiz`) — unless the link declares `outside`, which says
the member keeps its own namespace because that namespace names the
thing: the healing meditations are filed under Meditations and stay at
`/healing/planets` and `/healing/signs`. The sitemap is derived from that list, and the
integrity checks assert that every listed href and group landing has a
`page.tsx`, so the sidebar, the sitemap, and the route tree cannot drift
apart.

**Tools** (`src/lib/tools.ts`) is one sidebar row per tool, and a tool's
href IS one of its views: `/gematria` is the calculator, `/astrology` is
the chart, `/keyboard` is the piano. Its other views are routes nested
under it (`/gematria/dictionary`, `/astrology/hora`,
`/keyboard/tableau`), reached by the tab links `ToolLayout` draws — real
navigation, so a bookmark and a search result still name the view, each
view keeps its own bundle, and Hora asks for the reader's location only
when someone opens Hora. Those views have no nav row of their own, so
`TOOL_TABS` is what puts them in the sitemap and the search index.

**Reference** is what is LOOKED UP, a row per thing: the
Correspondences, the Major Arcana, the Minor Arcana, the Cube of Space,
the Tree of Life. The two Arcana are the cards as they are looked at —
the 22 Keys as the tableau, the 56 minors a column to a suit — where
`/correspondences/major-arcana` and `/correspondences/minor-arcana` are
the same cards' attributions as tables.
The correspondence TABLES are behind `/correspondences`, which is their
index — `src/lib/tables.ts` holds the list and the headings it groups
them under. **THE SET AND THE CUT ARE THE HERMETIC ORDER OF AQUARIUS'S**
(10 November 2026): the same fifteen tables under the same six headings
(Tarot, Languages, Alchemy, Qabalah, Astrology, and Tables as the
catch-all), each with that site's columns in that site's order, so a
reader who looks a thing up on one site finds the same table on the
other and a column added to one is a line to add to the other. It cost
five splits here — Astrology became Signs, Planets and Houses; Qabalah
became Sephiroth, Three Veils and Four Worlds; Chakras folded into the
Seven Forces, Tattvas and Elements into the Five Phases — each leaving a
`MovedTo` stub. What does NOT match is the chrome and the tools: these
tables are built from Catalyst and that site's from its own, the
players and the focus views are this site's, and the quizzes are that
site's. `src/components/ui/DataTable.tsx` is the one table component,
and takes the `head`/`rows` shape that site's does for exactly that
reason. `src/lib/tables.ts` with the strings staying in the message catalog under the
`nav.<href>.title` keys they always had. A table has no nav row, so that
file is also what puts the tables in the sitemap and the search index,
and an integrity check asserts each one is a real page under the index
that is the only navigation to it. This replaced three groups that
divided the same material by how it is drawn rather than by what it is:
eight table rows under Reference, a Devices group (the Cube and the
Tree) and a Tarot group (two tables and two ways of drawing the cards).
The cards keep `/tarot/<slug>`; `/tarot` itself is a stub now, so a card
page has no derived group crumb and names its own parent.

Legacy redirects, all stubs (a static export can't emit a 301; `MovedTo`
is the one component they all use). A stub redirects twice over: an
instant `<meta http-equiv="refresh">` in the HTML, which Google reads
as a permanent redirect, and a script for the client-side hop. Each one
names the page's CURRENT address, so `/reference/tattvas` goes straight
to `/correspondences/phases` and not through `/correspondences/tattvas`:

| From                                                                  | To                              |
| --------------------------------------------------------------------- | ------------------------------- |
| `/astrology-chart`, `/astrology/chart`                                | `/astrology`                    |
| `/gematria/calculator` (carrying `?seq=`)                             | `/gematria`                     |
| `/keyboard/piano`                                                     | `/keyboard`                     |
| `/healing`                                                            | `/meditations`                  |
| `/reference/<table>`, and the grade, sign and planet pages under them | `/correspondences/<table>`      |
| `/devices`                                                            | `/reference`                    |
| `/tarot`, `/tarot/tableau`, `/tarot/major-arcana`                     | `/major-arcana`                 |
| `/tarot/correspondences`                                              | `/correspondences/major-arcana` |
| `/tarot/minor-arcana`                                                 | `/correspondences/minor-arcana` |
| `/tarot/freeform`                                                     | `/freeform`                     |
| `/correspondences/astrology` and the sign and planet pages under it   | `/correspondences/signs`        |
| `/correspondences/qabalah`                                            | `/correspondences/sephiroth`    |
| `/correspondences/chakras`                                            | `/correspondences/forces`       |
| `/correspondences/tattvas`, `/correspondences/elements`               | `/correspondences/phases`       |
| `/files/lesser-ritual-of-the-pentagram`, `/files/tarot-back`          | `/files`                        |

`/tarot/major-arcana` listed the 22 Keys as text beside a
`/tarot/tableau` that drew them; one of the two had to be the index, and
the tableau is the one a reader recognises a Key from, so the list is
retired rather than moved.

### Local private pages

The `meditations` group is the Pattern on the Trestleboard and the two
healing meditations (at `/healing/…`, see above), and that is the whole
of it. **The ten legacy React courses were deleted on 10 November
2026**: they lived in the ignored `private/legacy` tree, mounted at
their former URLs by a generated dispatcher, and they were temporary --
standing in until the Hermetic Order of Aquarius could carry them,
which it does.

What is left is ONE development-only mount: `npm run dev` copies
`src/private-dev/app` to `/private/<group>/<slug>`, which renders
Markdown from the ignored `private/pages/`; `npm run build` unmounts it
before Next scans the route tree, and a direct production build runs
`private-mount.mjs check`, which stops if the route is still there. The
ignored `private/minor-meanings/` is read the same way, by the minor
card pages, with no mount of its own.
See [`private-pages.md`](private-pages.md) for the local workflow and the
Markdown page convention that works in any navigation group.

## Search engines

What a crawler is told, and where each part is decided (25 November
2026). `test/seo.test.ts` checks the first three from the source.

- **Canonical URL, per page.** Every docs page that should be indexed
  declares one through `canonicalFor(locale, path)` in `src/lib/nav.ts`
  (`localizedMetadata` calls it). It is what tells a crawler that
  `/tarot/0`, `/tarot/the-fool/?x=1` and `/tarot/the-fool/` are one
  page. It is per page because a layout cannot know the path, and
  Next's relative `./` form resolves against the build path, which for
  English is under `/en/` until `hoist-en.ts` runs.
- **Redirect stubs** carry no canonical; they redirect (above), and a
  stub never points at another stub.
- **The sitemap** (`src/app/sitemap.ts`) lists each address with its
  trailing slash, the form the export serves; without it every entry
  was a 301. It carries no `lastmod`, because the only date available
  was the build's.
- **`noindex`** is set in two layouts: `[locale]/layout.tsx` for an
  unreleased locale, and `(player)/layout.tsx` for every `/play`,
  `/expand` and `/focus` page, which are views of a docs page and have
  no text of their own in the HTML.
- **A page under a `Suspense` boundary exports as its fallback.** The
  Gematria views read the query string, so their fallback is the
  tool's title row; with none, the exported file had no heading.

## Content and data

See [`src/content/data/README.md`](../src/content/data/README.md) for the
full guide. In brief:

- **`content/data/` IS A GIT SUBMODULE**, `rosicrucian-dev/data`, mounted
  by both this site and the Hermetic Order of Aquarius (10 November
  2026). The tables are facts, and a fact has one home: a row fixed
  there is a fix on both sites, and `npm run check:data` warns when the
  checkout is behind, dirty or missing. `src/content/data/*.ts` is this
  site's reader over it — the Zod parse, the locale overlay and the
  joins — and stays here.
- `content/data/en/*.json` is the master copy of every language-carrying
  file. Translated siblings (`de/`) are the same shape with display values
  translated in place. The runtime reads **structure only from English**
  and merges in whitelisted display fields from the translation
  (`overlay-config.ts` is the whitelist; "overlay" means that merge).
- `src/content/data/schemas.ts` holds every Zod schema and is the single
  source of truth for shapes and TypeScript types. `npm run gen:schemas`
  derives the JSON Schema sidecars in `content/data/.schemas/` and the
  VS Code wiring from it; `npm run check:schemas` fails if they drift.
- Consumers import only from the `@/content/data` barrel.
- Prose (`content/texts`) is markdown plus one manifest line; recordings are markdown transcripts plus committed timing data.

## Search

The full-text search engine is the `@rosicrucian/search` package, developed
in the rosicrucian-dev repo (`packages/search/`) and shared with agelesswisdom
and botaschool. Its README explains the model (document, section, index,
result) and the API; the redesign that produced it is recorded in
`docs/search-engine-redesign.md`. An engine bug is fixed there and released;
this repo only holds the adapter (`src/lib/collectionSearch.ts`), the
generator and the dialog.

How search works, in one paragraph: a recording is a document — its title,
and its transcript paragraphs as the sections. `gen-recordings-search.ts`
hands those to the engine's `buildIndex`, which writes the index
(`recordings-search.json`, with the tokenizer it used in its header) and
one section-text file per recording. The dialog shows every match, ranked
phrase-first; `SNIPPET_ROWS` in `CollectionSearchDialog.tsx` caps how many
rows fetch their section texts for an excerpt. A result click opens the
recording at the matched paragraph (`#p<n>`) with the query in `?q=`;
`use-mark-query` marks the words on arrival and `TranscriptPlayer` cues the
audio from where the first mark sits. The index is precached by the service
worker per deploy; the section-text files carry the index's content stamp
in `?v=` and are cache-first.

The global title search (`src/lib/search.ts`) deliberately uses substring
matching instead: for ~250 short names ("2 of Cups") it is the right
matcher, and no index is needed.

## Offline service worker

`postbuild` runs `gen:sw`, which renders `scripts/sw.template.js` into
`out/sw.js` with a precache manifest scanned from the export. Edit the
template, never `out/sw.js`. Registration is production-only
(`ServiceWorkerRegistration.tsx`); the dev server never runs a worker.
To test template changes without a full build: `npm run gen:sw` against an
existing `out/`.

## iOS and PWA quirks

`SlidePlayer` does several things that look strange and are intentional.
Do not simplify them without testing on a real iPhone:

- The shell is `fixed inset-0` with `env(safe-area-inset-*)` padding, not
  `height: 100svh` (stale svh math in standalone mode rendered it short).
- While a player is mounted, the `html` background and
  `<meta name="theme-color">` are painted to the current slide color, so
  OS-owned regions (status-bar backing, the home-indicator strip, viewport
  gaps from iOS 26/27 bugs) blend instead of showing a white band.
- Standalone players get a small gap below the Dynamic Island via
  `--player-top-breather` in `tailwind.css`.
- The initial black paint (the `:not([data-primed])` rule in
  `tailwind.css`) locks iOS Safari's toolbar tint to black for the session,
  then releases after two animation frames.
- `AudioContext` closes on `visibilitychange` because iOS serializes the
  audio session across same-domain tabs.
- `SoundButton` shows a one-time hint about Silent Mode because there is
  no JS API to detect ringer state.

## Scripts

| Script                                                      | Runs        | Inputs                                    | Purpose                                                     |
| ----------------------------------------------------------- | ----------- | ----------------------------------------- | ----------------------------------------------------------- |
| `gen:search`                                                | `prebuild`  | `content/recordings/`                     | Full-text index + section texts for recordings search.      |
| `hoist:en`                                                  | `postbuild` | `out/`                                    | Moves the English export to the root.                       |
| `gen:sw`                                                    | `postbuild` | `out/`, `scripts/sw.template.js`          | Generates the offline service worker.                       |
| `check:schemas`                                             | CI          | `schemas.ts`                              | Fails if the generated JSON Schemas are stale.              |
| `gen:schemas`                                               | manual      | `schemas.ts`                              | Regenerates JSON Schema sidecars and VS Code wiring.        |
| `gen:translations`                                          | manual      | `content/data/en/`, `content/messages/en` | Creates or resyncs translated-locale skeletons.             |
| `gen:gematria-words`                                        | manual      | `scripts/vendor/*.json`                   | Builds `public/data/gematria-words.json` (committed).       |
| `gen:appicon` `gen:favicon` `gen:social` `gen:splash`       | manual      | `assets/cube.svg`                         | Icon, favicon, social card, and iOS splash images.          |
| `gen:cube-pdf`                                              | manual      | data layer                                | Printable Cube of Space PDF (writes to `local/`).           |
| `gen:recordings` `gen:recordings:timings` `fix:transcripts` | maintainer  | `local/` + Whisper pipeline               | Transcript and timing data for recordings. Off-repo inputs. |
| `optimize:tarot` `zip:tarot`                                | maintainer  | original card scans                       | Card image derivatives and the downloadable zip.            |
| `scripts/stage-r2-audio.ts`                                 | maintainer  | R2 credentials                            | Uploads recording audio to object storage. Run directly.    |
| `scripts/gen-paul-case.ts`                                  | frozen      | private OCR                               | Produced `scripts/vendor/paul-case.json` once.              |

"Maintainer" scripts need files that are not in the repository; they are
documented so their outputs are understood, not so contributors run them.

The tarot art styles are listed in `src/content/data/tarot-styles.ts`, one
registry per arcana; **AI Render is the default for both** (20 November
2026): the cards painted by an image model after the official drawings. Its
images (`public/tarot/major/ai-render/` with `thumbs/`,
`public/tarot/minor/ai-render/`) are
not made by `optimize:tarot`: they are written by the deck's own tool,
../tarot-studio (`notes/toolbox-export.py`), and re-running that replaces them.
Its Minors are framed as the official cards are, title boxes and no key words.
The Files downloads and their previews (`MinorTableau`) stay the Josh Yates and
Traditional/Modern sets that the zips hold.
