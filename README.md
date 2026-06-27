# BOTA Toolbox

BOTA Toolbox is a project of [Rosicrucian Developers](https://github.com/rosicrucian-dev). For questions, contact [Jonathan](mailto:jonathan@rosicrucian.dev). You can open an issue or help contribute on [GitHub](https://github.com/rosicrucian-dev/botatoolbox).

The material used for this website is gathered using publicly available information from <a href="https://bota.org">Builders of the Adytum</a>, <a href="https://lvx.org">Fraternity of the Hidden Light</a>, and other sources. Colors were specifically chosen using FLO's sequence of color cards from [Color Aid](https://coloraid.com). The minor arcana images are colored and provided with permission by <a href="https://joshyates.me/">Josh Yates</a>.

Join the [Symposium of the Rose](https://discord.gg/hKWWH6ukdV) on Discord to discuss this and other Rosicrucian related projects.

## Getting started

To get started with this project, first install the npm dependencies:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Project structure

The app is **data-driven**: most pages render from editable data and
markdown, so you can contribute content without touching React. There are
two halves, split by where the files live:

| Where                | What                                                            |
| -------------------- | -------------------------------------------------------------- |
| `content/data/*.json`| Editable data (tarot attributions, sephiroth, words, …). Each has a `*.schema.json` sidecar giving you autocomplete + validation in your editor. |
| `content/data/generated/` | **Built** data — produced by `npm run gen:*`. Don't hand-edit; edit the source and regenerate. |
| `content/texts/*.md` | Prose texts, plus `content/data/texts.json` listing them.       |
| `content/rituals/*.md` | Ritual walkthroughs.                                          |
| `src/content/data/`  | Typed views of the JSON (Zod-validated) + lookup maps. Re-exported from `@/content/data`. See its [README](src/content/data/README.md). |
| `src/lib/`           | Framework/UI utilities — hooks, audio, color theming, gematria math. |
| `src/components/`    | Shared React components.                                        |
| `src/app/`           | Routes. `(docs)` are normal pages; `(player)` are full-screen meditation/slide players. |
| `scripts/`           | One-off generators (`gen:schemas`, `gen:gematria-words`, image optimization, the cube PDF). `scripts/vendor/` holds public-domain build inputs. |

## Contributing content

- **Edit data** — change a value in `content/data/*.json`; your editor
  validates it against the schema. Add a brand-new data file by following
  the recipe in [`src/content/data/README.md`](src/content/data/README.md).
- **Add a text** — drop `content/texts/<slug>.md` and add one line to
  `content/data/texts.json`. It appears in the nav and sitemap
  automatically. No code.
- **Cross-reference, don't duplicate** — one page reads from several data
  files (e.g. the gematria dictionary's "Numbers" cards read tarot,
  sephiroth, and tree-path data). References between files are checked at
  build by `src/content/integrity.ts`.

> `CLAUDE.md` is guidance for AI assistants working in this repo, not the
> human contributor guide — start here and in `src/content/data/README.md`.
