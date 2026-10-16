# Contributing

Thanks for helping with BOTA Toolbox. Start with
[`docs/architecture.md`](docs/architecture.md) for the shape of the
project; this file covers the day-to-day workflow.

## Setup

Node 24 or newer (`.nvmrc` pins 24, which is what CI uses).

```bash
npm ci
npm run gen:search   # builds the gitignored search index (once per clone)
npm run dev          # http://localhost:3000
```

To test from a phone on your LAN, copy `.env.example` to `.env.local` and
set `NEXT_DEV_ORIGINS` to your machine's IP.

## Verifying changes

The dev server and `npm run build` share the `.next/` folder. **Do not run
`npm run build` while the dev server is running**; it breaks the server
until you restart it. Use these instead:

| Check                   | When                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`      | Always. Catches nearly everything.                                                                             |
| `npm run lint`          | Always.                                                                                                        |
| `npm test`              | When touching `content/`, `src/content/` (the integrity checks and locale merge run here) or the search files. |
| `npm run check:schemas` | When touching `src/content/data/schemas.ts` (run `gen:schemas` to fix).                                        |
| `npm run check:shared`  | When touching a file shared with `agelesswisdom` (see docs).                                                   |
| `npm run verify:build`  | New routes, data or integrity changes, RSC boundary errors. Writes to `.next-verify/`, safe alongside dev.     |

CI runs all of these plus a full build on every pull request.

## Conventions

- **Formatting** is Prettier (no semicolons, single quotes, organized
  imports, sorted Tailwind classes). Run it on save; there is no lint-staged
  hook.
- **Files:** `PascalCase.tsx` for components, `useThing.ts` for hooks,
  `camelCase.ts` for other modules. The five search files in `src/lib/`
  keep kebab-case names because they are shared byte-for-byte with the
  sibling project.
- **Where code goes:** a component used by one route sits next to that
  route (`*Client.tsx` when it is a client component). Used by two or more
  routes, it goes in the matching area folder under `src/components/`
  (`layout/`, `ui/`, `nav/`, `locale/`, `search/`, `player/`, or a domain
  folder such as `tarot/`). Data, lookup maps, and cross-file references
  live in `src/content/data/`. In `src/lib/`, hooks go in `hooks/`,
  persisted preferences in `stores/` (built on `createPersistedStore`),
  audio in `audio/`, and everything else at the root.
- **Links:** always `Link`/`PlainLink`/`useLocaleRouter` from
  `@/components/locale/LocaleLink`. ESLint blocks the raw Next.js imports.
- **Page titles:** a page named after its nav entry exports
  `generateMetadata = localizedMetadata('Title')` from `@/lib/nav` rather
  than hand-writing the params boilerplate.
- **Content changes** (new data file, text, ritual, translation) follow the
  steps in `src/content/data/README.md`. Consumers import only from the
  `@/content/data` barrel.
- **Comments:** file headers explain _why_, especially for anything
  iOS-specific. Keep them accurate when you change behavior; stale comments
  are treated as bugs.
- **Vendored code:** `src/components/catalyst/` is Tailwind Catalyst with
  two local edits, listed in its README. Do not restyle it in place.

## Pull requests

- Branch from `main`. Keep PRs focused; a refactor and a feature are two
  PRs.
- Write commit messages that say what changed and why. `git log` is part
  of the documentation.
- Do not commit generated search indexes, `.env.*`, or anything under
  `local/`.
