# Generated data — do not hand-edit

Files in this folder are **produced by build scripts**, not written by
hand. Editing them directly will be overwritten the next time the
generator runs. To change this data, edit the *source* and regenerate.
The outputs are committed, so a fresh clone builds and runs without
executing any generator.

| File (output path)                | Generator                    | Source                                                                                                 |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `public/data/gematria-words.json` | `npm run gen:gematria-words` | `scripts/vendor/sepher-sephiroth.source.json` + `strongs-hebrew.source.json` + `paul-case.json` |

Each generated file still has a Zod schema in
`src/content/data/schemas.ts`; the generator validates its output against
that schema before writing, so a malformed build fails loudly.

> Note: this file is large, so it lives in `public/` and is
> **fetched on demand** (not bundled). See
> `src/content/data/gematria-words.ts` and `gematria-sources.ts`.
