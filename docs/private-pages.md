# Local private pages

The public site has no member password or join-date form. A password in a
static site never protected the source: anyone could fetch the exported HTML
or JavaScript. Private material now lives under the Git-ignored `private/`
directory and is available only from the local development server.

## Add a page

Create a Markdown file under `private/pages/`, for example:

```text
private/pages/my-notes.md
```

```markdown
---
group: reference
title: My Notes
order: 10
---

# My Notes

Private text goes here.
```

`group` must be an existing navigation group such as `meditations`,
`reference`, or `utilities`. The file name supplies the URL slug and uses
lower-case letters, numbers, and hyphens. `title`, `slug`, `locale` (`en` or
`de`), and `order` are optional; the first Markdown heading supplies the
title when omitted. The older `private/pages/<group>/<slug>.md` layout also
works and infers `group` from its folder. Run `npm run dev`. The page appears
in its group's navigation and opens at `/private/<group>/<slug>` (or
`/de/private/...`). Adding, editing, and removing Markdown files refreshes
the local navigation within about two seconds, without a server restart.

Markdown is the default format for personal pages. React/TypeScript pages
can use the same local-only mount pattern as the existing courses, but
they need a route and imports; arbitrary JavaScript files should not be
executed merely because they were dropped in a folder.

## The meditation courses are gone (10 November 2026)

Ten React courses used to live in `private/legacy/` and mount at their
old `/meditations/<slug>` URLs through a generated dispatcher, an
`@private/` import alias and a stylesheet of their own. They were
TEMPORARY, standing in until the Hermetic Order of Aquarius could
carry them, and they were deleted once it could: all ten are courses
there now, with `concentration` under Section C and `daily-meditation`
under the Schedule. The public Meditations group is what it always
showed -- the Pattern on the Trestleboard and the two healing
meditations.

What went with them: the dispatcher and the course layout
(`src/private-dev/course-dispatcher.tsx`,
`src/private-dev/meditations-layout.tsx`), the local-only stylesheet
(`src/styles/private-legacy.css`), the `@private/*` tsconfig path and
its test-loader alias, `privateLegacySlugs()` and the course manifest
it read, the Meditations group's local nav rows, their ten `nav.*`
message keys, the eight schemas in the data repository that described
their JSON, and about 140 lines of `scripts/private-mount.mjs`. What
is left is one mount, which is the Markdown route above.

Daily Meditation read the join date from `private/config.json`:

```json
{ "joinDate": "2024-08-23" }
```

That file is ignored by Git and nothing reads it now; it is harmless
to leave and safe to delete.

The former gated minor-arcana meanings are also kept locally in
`private/minor-meanings/`. They appear on minor-card pages during local
development and are absent from public card data and exports.

`npm run build` removes all private mounts before generating the static
site. `npm run dev` restores them. A direct `next build` refuses to run
while any private mount is present, including supporting modules and data.
The ignored `private/` directory must
also be excluded from any manual upload, backup sync, or custom hosting
step. A clone of the public repository has the generic local-page
mechanism but none of your private content.

Stop the local server before running `npm run verify:private-export`. It builds
with harmless private Markdown and CSS test markers and checks that their
content and private routes are absent from `out/`. Run `npm run dev` again
afterward.

`npm run dev` binds to `127.0.0.1` and enables private mode. For phone or LAN
testing, `npm run dev:public` disables private mode, unmounts the private
routes, and binds to all interfaces. Do not point a tunnel at the private
development server.

Removing files in a new commit removes them from the current Git tree.
Earlier commits and any deployed copies still contain the old material;
purging those requires a separate history rewrite and clearing published
artifacts and caches.
