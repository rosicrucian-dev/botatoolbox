# Search engine redesign — task list

Status: steps 0–3 implemented 2026-10-10 in both repos (uncommitted at the
time of writing); step 4's manual browser checks are still to do. Applies to
**botatoolbox** and **agelesswisdom** together; the shared files stay
byte-identical across the two repos under `check:shared`, exactly as today.
Extraction into a package is a later step and is out of scope here.

Where the implementation departed from the plan below, the code is right and
this note says why:

- `buildIndex` lives in its own `build.ts` (pure, no Node imports) so the
  browser bundle never sees it; `index.ts` re-exports it anyway for scripts.
- `occurrences(index, query, result, options)` takes the query explicitly;
  results carry a `docIndex` so it can find its document.
- Body positions leave a one-position gap between sections, so a phrase can
  never straddle two paragraphs.
- Ranking: having the phrase is a **tier**, not a sort key; within a tier
  BM25F decides, with each phrase occurrence credited like a rare word. The
  goldens showed that ordering by phrase count buried the lesson named "The
  Life-Power" under long lessons that repeat the words. k1/b are 2.0/0.3, not
  the textbook 1.2/0.75, after a measured sweep on both corpora (see the
  comment above the constants).
- Engine-internal imports carry `.ts` extensions: generator scripts run under
  plain `node --experimental-strip-types`, which does not resolve extensionless
  relative imports.
- The hooks live under `src/lib/search-engine/react/`; `use-chunked-limit.ts`
  stays at `src/lib/` as a plain UI helper (still shared).
- Each dialog shows a reload prompt on `IndexFormatError`; agelesswisdom gained
  two message keys for it (`search.outdated`, `search.reload`).

## Why

The engine (`src/lib/search-engine.ts` and the four hooks) is algorithmically
sound — positional index, BM25, phrase-first, quoted groups, one tokenizer on
both sides — but its boundaries are those of an internal module:

- numbers are not tokens ("Key 21", "Lesson 12", "1909" are unsearchable);
- no Unicode folding (café ≠ cafe; Hebrew finals and nikkud not folded);
- "where in the document" is not an engine concept, so agelesswisdom carries
  block spans on its doc type and botatoolbox regex-scans sidecars instead;
- the index has no format version, no record of its tokenizer, and both sites
  bolt `version` (and one of them `locale`) onto it ad hoc;
- Tailwind classes, the `?q=` name and `[data-para]` are hardcoded in shared
  code;
- titles are concatenated into the body, so agelesswisdom re-sorts results by
  title match to compensate;
- prefix expansion scans the whole vocabulary on every keystroke.

None of this is a rewrite. The algorithms, the sidecar strategy and the tests
survive. What changes is the model the API exposes and the file the browser
downloads.

## The model

> A document is a **title** and an ordered list of **sections**, each optionally
> carrying an **anchor**. At build time `buildIndex` turns documents into one
> **index** JSON (what the browser downloads to search) and one small JSON of
> **section texts** per document (fetched only to show excerpts). At runtime you
> `loadIndex`, `search`, and each **result** names the document, how well it
> matched, and the best section and anchor to link to. Everything that marks
> words on screen uses the tokenizer the index was built with, so what you
> highlight is what matched.

Four nouns: document, section, index, result. About a dozen exported names.

## Shared files (byte-identical in both repos)

```
src/lib/search-engine/
  index.ts          re-exports everything below
  tokenizer.ts      TokenizerConfig, resolveTokenizer → { tokenize, spans, config }
  format.ts         FORMAT = 1, SearchDocument, SearchIndex, buildIndex
  query.ts          loadIndex, IndexFormatError, parseQuery, search, occurrences
  text.ts           Part, highlight
  dom.ts            markText, locate
  react/
    use-search-index.ts    useSearchIndex(url)
    use-section-texts.ts   useSectionTexts(urls)      (was use-snippets)
    use-mark-query.ts      useMarkQuery(ref, options) (was use-highlight-query)
src/lib/use-chunked-limit.ts   unchanged; a list-scrolling helper, not search
test/search-engine/
  tokenizer.test.ts  format.test.ts  query.test.ts  text.test.ts
scripts/check-shared.ts
```

`src/lib/search-engine.ts` is deleted; the directory's `index.ts` means every
existing `@/lib/search-engine` import still resolves. The old
`use-search-index.ts`, `use-snippets.ts`, `use-highlight-query.ts` and
`test/search-engine.test.ts` are deleted.

### tokenizer.ts

```ts
export interface TokenizerConfig {
  locale: string // stopword list key; 'en' fallback
  stopwords?: 'default' | 'none' | string[]
  numbers?: boolean // default true
  fold?: boolean // default true: NFKD, strip \p{M}, lowercase
  hebrewFinals?: boolean // default true: ךםןףץ → כמנפצ
}
export interface Span {
  token: string
  start: number
  end: number
}
export function resolveTokenizer(config: TokenizerConfig): Tokenizer
interface Tokenizer {
  config: Required<TokenizerConfig> // fully resolved; this is what the index records
  tokenize(text: string): string[]
  spans(text: string): Span[] // same tokens, with character offsets into `text`
}
```

Rules carried over: token regex becomes `[\p{L}\p{N}][\p{L}\p{N}']*`,
apostrophes trimmed, `'s` folded, single **Latin letter** tokens dropped (a
lone digit or a lone Hebrew letter stays). Stopword lists `en` and `de` move
here unchanged. The config is plain data; no function slots in v1.

### format.ts

```ts
export const FORMAT = 1
export interface SearchDocument<Meta = unknown> {
  id: string
  title: string
  sections: Array<{ text: string; anchor?: string }>
  meta?: Meta // carried through untouched
}
export interface SearchIndex<Meta = unknown> {
  format: 1
  tokenizer: Required<TokenizerConfig>
  titleBoost: number
  stamp: string // sha256 of all section texts, 12 hex
  terms: string[] // sorted; prefix = binary-search range
  postings: { title: number[][]; body: number[][] }
  // per term: [doc, count, p0, Δ1, Δ2, …] runs
  docs: Array<{
    id: string
    title: string
    meta?: Meta
    len: { title: number; body: number }
    sections: { start: number[]; anchor: (string | null)[] }
  }>
}
export function buildIndex<Meta>(
  docs: SearchDocument<Meta>[],
  options: { tokenizer: TokenizerConfig; titleBoost?: number }, // default 3
): { index: SearchIndex<Meta>; sections: Record<string, string[]> }
```

The body is the sections joined; `start[i]` is the body token offset where
section `i` begins. A document with no sections gets one section of empty text.
`sections` in the return value is the whitespace-normalized text of each
section, keyed by document id, ready to be written wherever the site hosts it.
`stamp` is computed here, so both generators drop their own hashing.

### query.ts

```ts
export class IndexFormatError extends Error {
  code: 'format'
}
export function loadIndex<Meta>(json: unknown): SearchIndex<Meta>
// asserts format === 1 (else IndexFormatError), attaches a decoded-postings
// cache (WeakMap keyed on the index object)
export interface Query {
  segments: Array<{ terms: string[]; quoted: boolean }>
  terms: string[] // flattened
  phrases: Array<[number, number]> // quoted groups of 2+ as [start, end) into terms
  prefixLast: boolean // last segment is loose
}
export function parseQuery(index: SearchIndex, text: string): Query
export interface Match {
  where: 'title' | 'body'
  position: number // token offset in that stream
  section?: number // body only
  anchor?: string // body only, when the section has one
}
export interface SearchResult<Meta> {
  id: string
  title: string
  meta?: Meta
  score: number // BM25F over title and body
  count: number // all occurrences of all terms
  phrase: number // contiguous occurrences (quoted groups, else whole query)
  best: Match
}
export function search<Meta>(
  index: SearchIndex<Meta>,
  query: Query | string,
  options?: { limit?: number },
): SearchResult<Meta>[] // default limit: all
export function occurrences<Meta>(
  index: SearchIndex<Meta>,
  query: Query | string,
  result: SearchResult<Meta>,
  options?: { max?: number },
): Match[] // ascending, body then title; default max 200
```

Ranking: documents with the phrase form the top tier; within a tier, `score`
decides. Scoring is BM25F-lite: for each term, idf × Σ over the two streams of
`boost · tf · (k1+1) / (tf + k1 · (1 − b + b · len/avglen))`, title boost from
the header, plus the same saturating credit for each occurrence of the phrase
itself at the rarest term's idf; k1 = 2.0, b = 0.3 (see the note at the top
and the comment above the constants). Prefix expansion of the last loose term (min
length 3, as now) uses the sorted `terms` range, not an object scan. `best`
prefers the first phrase hit in the body, then in the title, then the first
occurrence of the rarest term, body first. Quoted groups remain a hard filter.

### text.ts and dom.ts

```ts
export interface Part {
  text: string
  hit: boolean
}
export function highlight(
  index: SearchIndex,
  text: string,
  query: Query,
  options?: { window?: number; leadIn?: number; ellipsis?: string },
): Part[] // no `window` → whole text marked (was highlightParts);
// with `window` → excerpt around the first hit (was snippetParts, 190/60/'…')

export function markText(
  container: HTMLElement,
  query: Query,
  tokenizer: Tokenizer,
  options?: { className?: string; element?: string },
): HTMLElement[] // marks created, in document order; phrase runs first, else term hits
export function locate(
  mark: HTMLElement,
  blockSelector: string,
): { index: number; fraction: number } | null
// nearest ancestor matching the selector, its numeric data index, how far through its text the mark sits
```

Hits are decided from tokenizer **spans**, not a regex over the raw text, so
folding and numbers behave identically to the index. The prefix rule for
marking matches the query's: only the last loose term expands.

### react/

```ts
useSearchIndex<Meta>(url): { status: 'loading' | 'ready' | 'error'; index: SearchIndex<Meta> | null; error?: Error; retry() }
useSectionTexts(urls: string[], options?: { debounceMs?: number }): Map<string, string[]>
useMarkQuery(ref, options: {
  tokenizer: TokenizerConfig          // the arrival page has no index in hand; pass { locale }
  param?: string                      // default 'q'
  className?: string
  scroll?: 'auto' | 'never'           // 'auto' skips when location.hash is set (today's rule)
  dep?: unknown
  onMarked?: (marks: HTMLElement[]) => void
}): void
```

No class names, parameter names or attribute names remain hardcoded in shared
code. `useChunkedLimit` is unchanged and stays at `src/lib/`.

## Step 0 — characterize (both repos, before any engine change)

Purpose: see what the redesign changes in ranking, deliberately, with a diff to
review rather than a feeling.

- Add `test/search-golden.test.ts` (project-local). Loads the built index from
  `public/` (skips with a note if absent — CI builds before tests only in
  botatoolbox's order, so this must tolerate a fresh clone), runs ~15 real
  queries through the **project adapter's** search call, and compares the top
  ten ids plus `phrase`/`count` with `test/fixtures/search-golden.json`.
  `UPDATE_GOLDEN=1 npm test` rewrites the fixture. Commit the fixture produced
  by the **current** engine.
  - botatoolbox queries: `tarot`, `tree of life`, `"tree of life"`, `key 21`,
    `cube of space`, `first matte`, `color`, `colors`, `qabalah`, `meditation
on the`, `ann davies`, `"pattern on the trestleboard"`, `hod`, `א`, `the`.
  - agelesswisdom queries: `the life power`, `"the life power"`, `tree of
life`, `tarot`, `key 0`, `lesson 12`, `subconsciousness`, `Tiphareth`,
    `tiferet`, `color`, `colours`, `occult`, `"first matter"`, `ב`, `and`.
- Add `scripts/bench-search.ts` (project-local): times 50 queries against the
  built index and prints total ms. Record the number in the PR description.

## Step 1 — the shared engine (write in botatoolbox, copy to agelesswisdom)

botatoolbox's formatting (no semicolons, single quotes) is the canonical one,
as today. Write and test here first.

1. `src/lib/search-engine/tokenizer.ts` with `test/search-engine/tokenizer.test.ts`.
   Port the four tokenizer tests from the old test file; add: numbers kept,
   `café`/`cafe` equal, `מלך`/`מלכ` equal, `fold: false` preserves accents,
   `stopwords: 'none'`, spans offsets round-trip (`text.slice(start, end)`
   re-tokenizes to the span's token after folding).
2. `src/lib/search-engine/format.ts` with `format.test.ts`: encode/decode
   postings round-trip; `start` offsets per section; one-section fallback;
   `stamp` changes when any section text changes and not when `meta` changes;
   `terms` sorted.
3. `src/lib/search-engine/query.ts` with `query.test.ts`. Port every ranking
   invariant from the old test file (stopwords dropped both sides so quoted
   "tree of life" matches; prefix on last loose term only; quoted group is a
   hard filter; unterminated quote stays loose; `best` is first phrase else
   rarest). Add: `loadIndex` rejects `{ format: 2 }` and a legacy `{ docs,
words, lengths }` object with `IndexFormatError`; title boost lifts a title
   hit over a body-only hit with equal tf; `occurrences` lists every hit with
   its section and anchor; prefix expansion result equals the old
   object-scan result on a small fixture.
4. `src/lib/search-engine/text.ts` with `text.test.ts`: port the snippet and
   highlight tests; add a folded hit (`café` marked for query `cafe`) and a
   numeric hit.
5. `src/lib/search-engine/dom.ts`: port `markMatches` onto spans. No test in
   Node (no DOM); covered by the manual checklist below.
6. `src/lib/search-engine/react/*`: port the three hooks with the new options.
7. `src/lib/search-engine/index.ts` re-exporting all of the above.
8. Delete `src/lib/search-engine.ts`, `src/lib/use-search-index.ts`,
   `src/lib/use-snippets.ts`, `src/lib/use-highlight-query.ts`,
   `test/search-engine.test.ts`.
9. `scripts/check-shared.ts`: the list becomes directory-aware —
   `src/lib/search-engine/` (recursive), `src/lib/use-chunked-limit.ts`,
   `test/search-engine/` (recursive), `scripts/check-shared.ts`. Keep the
   `.prettierignore` assertion; it now checks the directory entries.
10. Copy the whole set to agelesswisdom unchanged. Run `npm run check:shared`
    in both.

## Step 2 — botatoolbox wiring

- `scripts/gen-recordings-search.ts`
  - Build `SearchDocument`s: `id: slug`, `title`, `meta: { subtitle: grouping,
href }`, `sections: splitParagraphs(body).map(text => ({ text:
stripMarkdown(text) }))`. No anchors: the paragraph **index** is the join
    with the timings, and the transcript page already handles `#p<n>`.
  - `stripMarkdown` moves out of the engine into this script (its only user).
  - Call `buildIndex(docs, { tokenizer: { locale: 'en' } })`. Write
    `sections[slug]` to `public/data/recordings-snippets/<slug>.json`. Delete
    the local sha256 code; `index.stamp` replaces `version`.
  - Replace `CollectionSearchIndexSchema.parse(index)` with
    `loadIndex(JSON.parse(JSON.stringify(index)))` (a round trip proves the
    file on disk loads). Delete `CollectionSearchIndexSchema` from
    `src/content/data/schemas.ts` (lines ~175–196); the format belongs to the
    engine now. Confirm `scripts/gen-schemas.ts` has no entry for it.
  - Keep the timings-drift warning exactly as is.
- `scripts/gen-sw.ts` (~lines 92–99): read `.stamp` instead of `.version`.
- `src/lib/collectionSearch.ts` shrinks to: `SearchTrackMeta { subtitle?:
string; href: string }`, `type RecordingsIndex = SearchIndex<SearchTrackMeta>`,
  `snippetUrl(id, stamp)`. Delete the `searchIndex` wrapper and the
  `tokenize` re-export.
- `src/components/search/CollectionSearchDialog.tsx`
  - `useSearchIndex<SearchTrackMeta>(indexUrl)`; `parseQuery(index, query)`
    once per keystroke (memoized); `search(index, parsed)`.
  - Row title: `highlight(index, result.title, parsed)`. Row excerpt: the
    section text at `result.best.section` from `useSectionTexts`, through
    `highlight(index, text, parsed, { window: 190 })`. Delete the `snippetFor`
    regex scan and its memo.
  - Select: `router.push(\`${meta.href}?q=${encodeURIComponent(query)}#p${best.section}\`)`when`best.where === 'body'`, else without the hash. This is new behaviour:
recordings results now deep-link to the paragraph, and the player's
existing `#p(\d+)` effect scrolls and cues to it.
  - `status === 'error' && error instanceof IndexFormatError`: show "Search
    was updated — reload" with a reload button instead of the retry copy.
- `src/components/player/TranscriptBody.tsx` and `TranscriptPlayer.tsx`
  - `useMarkQuery(ref, { tokenizer: { locale: 'en' }, dep, className: 'rounded-sm
bg-amber-200/70 text-inherit dark:bg-amber-400/30', onMarked })`.
  - In the player, `onMarked: marks => { const at = locate(marks[0],
'[data-para]'); if (at) cueTo(at.index, at.fraction) }`. Note the hash
    effect now also cues (to the paragraph start) on arrival from search;
    the fraction cue runs after it and wins. Acceptable; say so in a comment.
- `test/collection-search.test.ts`: rewrite for the smaller adapter.
- `test/search-golden.test.ts`: run, review the diff, decide, `UPDATE_GOLDEN=1`.
- `docs/architecture.md`: the "Where shared code lives" note (~line 46), the
  search section (~lines 149–167) and the scripts table row (~line 205).
  `CLAUDE.md` guardrail bullet about the five files → the directory.

## Step 3 — agelesswisdom wiring

- `scripts/gen-search-index.ts`
  - Documents: `id: lessonUrl(...)`, `title: numberedLessonTitle(...)`,
    `meta: { href, section: section.label }`, sections from `blocksOf()`.
    Anchor rule, local to this generator: an **unanchored** block (heading,
    footnotes, JSX) becomes its own section carrying the anchor of the **next**
    anchored block (trailing ones take the last). A heading hit therefore
    excerpts the heading with its words marked and links to the paragraph
    beneath it — better than today's unmarked paragraph under a marked title.
  - Delete `blockStarts` entirely; the engine computes section offsets. Stop
    prepending the title to the text; the title stream is separate.
  - Keep the majority-vote `indexLocale` logic; pass it as `tokenizer: {
locale: indexLocale }`. Delete the hand-written `locale` and `version`
    fields on the index; both now live in the header.
  - Write `sections[id]` to `public/search/<locale>/<href>.json` and the index
    to `public/search-index.<locale>.json`, as now.
- `scripts/gen-sw.ts` (~lines 92–99): `.stamp`.
- `src/lib/search.ts` shrinks to: `LessonMeta { href: string; section:
string }`, `type LessonIndex = SearchIndex<LessonMeta>`, `searchIndexUrl(locale)`,
  `snippetUrl(locale, id, stamp)`, `resultHref(result)` = `meta.href` plus
  `#anchor` when `best.anchor` is set. Delete `resultBlock`, `titleMatches`,
  `searchLessons` and the `SearchLesson.blocks/anchors` fields — the title
  boost and `best.anchor` replace all of them.
- `src/components/search-dialog.tsx`: same changes as botatoolbox's dialog.
  Delete the `queryLocale` plumbing (`index.tokenizer` is authoritative).
  Excerpt rule: section at `best.section`; if `best.where === 'title'`, the
  first section. Delete `pickSnippet`.
- `src/components/highlight-matches.tsx`: `useMarkQuery(ref, { tokenizer: {
locale }, dep, className: '…' })`. The `locale` prop keeps its meaning
  (content locale, not URL locale).
- `.prettierignore`: replace the seven file lines with
  `src/lib/search-engine/`, `src/lib/use-chunked-limit.ts`,
  `test/search-engine/`, `scripts/check-shared.ts`.
- `test/search.test.ts`: rewrite for the smaller adapter (`resultHref` with
  and without an anchor; `snippetUrl` with and without a stamp).
- `test/search-golden.test.ts`: run, review, decide, update.
- `CLAUDE.md` search section: replace the seven-file paragraph and the
  `index.locale` instruction.

## Step 4 — verify (each repo, independently)

```
npm run check:shared
npx tsc --noEmit
npm test
npm run gen:search            # botatoolbox: gen:search:recordings
npm run verify:build          # then hoist/gen-sw against .next-verify as each CLAUDE.md says
npm run lint                  # agelesswisdom also: npx prettier --check .
```

Manual, in the dev server, both sites:

- Type a query letter by letter; results stay live; a closing quote narrows.
- `key 21` (bota) / `lesson 12` (aw) find what they should.
- `cafe` finds `café`; `tiferet` still does not find `Tiphareth` (expected).
- A row's excerpt is the paragraph the link goes to; the marked words in the
  title and the excerpt are the words typed.
- Select a result: the page opens at the paragraph, the words are marked,
  nothing scrolls a second time. On a bota recording, Play starts at the words.
- Search while offline after one online visit (service worker precache).
- Simulate a stale index: serve an old `recordings-search.json` → the dialog
  shows the reload message, not a crash.
- Phone width: rows still fit on one line with the count column.

Record the bench number next to the step-0 one.

## Decisions pinned here

| Decision                 | Value                                                           | Change later by                                   |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------- |
| Title boost              | 3                                                               | `buildIndex` option; golden diff shows the effect |
| Phrase ranking           | tier (has phrase), then score                                   | sort in query.ts                                  |
| BM25 k1, b               | 2.0, 0.3 (measured; textbook 1.2/0.75 over-rewarded short docs) | constants in query.ts                             |
| Phrase credit            | each phrase occurrence scored like the rarest term              | query.ts, after the per-term loop                 |
| Section gap              | 1 position between sections                                     | build.ts                                          |
| Fold accents and marks   | on                                                              | tokenizer config, recorded in index               |
| Numbers are tokens       | on                                                              | tokenizer config                                  |
| Hebrew finals folded     | on                                                              | tokenizer config                                  |
| Prefix min length        | 3                                                               | constant in query.ts                              |
| Excerpt window / lead-in | 190 / 60                                                        | `highlight` options                               |
| Occurrences cap          | 200                                                             | `occurrences` option                              |
| Section-text debounce    | 150 ms                                                          | hook option                                       |
| Format on mismatch       | reload prompt                                                   | dialog                                            |

## Deliberately deferred

- Stemming and typo tolerance (the sorted `terms` array and the header are the
  hooks; add when a real query fails).
- Filters and facets (a predicate over `meta` on results; no format change).
- Splitting `terms`/`postings` into separately fetched files for large
  corpora (format 2, when a corpus needs it).
- The "every hit per page" UI (phase 3): `occurrences` is in the API from day
  one; the dialogs use `best` only until the UI is designed.
- Extraction to an npm package.
