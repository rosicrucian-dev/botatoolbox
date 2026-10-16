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

## Existing meditation courses

The former member-only courses, supporting components, and data are in
`private/legacy/`. `npm run dev` generates one local course dispatcher from
the private course folders. Its imports use the `@private/` source alias.
The old course URLs and their links in the Meditations group still work.
The public Pattern on the Trestleboard remains in the committed site. A
new private React course needs a `page.tsx` in its own folder under
`private/legacy/src/app/[locale]/(docs)/meditations/`; rerun `npm run dev`
to register it. A single `[name]/page.tsx` detail route is supported.

The legacy course utilities are generated into a local-only stylesheet.
The public stylesheet does not scan `private/legacy/`, so adding a CSS class
to a private component cannot put it into a public build. React courses
still use the mount step; ordinary Markdown pages refresh without it.

Daily Meditation reads the join date from `private/config.json`:

```json
{ "joinDate": "2024-08-23" }
```

Use your actual join date in `YYYY-MM-DD` format. This file is ignored by
Git and stays on your machine. No password or Settings form is involved.

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
