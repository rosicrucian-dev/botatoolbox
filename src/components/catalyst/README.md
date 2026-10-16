# Vendored: Tailwind Catalyst

These files are copied from the Tailwind Plus **Catalyst UI kit**
(`typescript/` distribution, changelog dated 2025-08-13) and then run
through this project's Prettier config. Catalyst is licensed to the
maintainer; the license does not allow redistributing the kit itself, only
using its components in a product, which is what this is.

Only two files differ from upstream beyond formatting:

- `link.tsx` is rewritten to render `Link` from `@/components/LocaleLink`
  instead of a bare `<a>`, so every Catalyst-rendered href (Button, Table
  rows, Listbox) stays locale-aware.
- `button.tsx` uses a pill radius (`rounded-full`, upstream is
  `rounded-lg`) and a flat emerald color variant for the Expand/Play
  toolbar buttons. Both edits are marked inline. `src/lib/toolbarButton.ts`
  restores the square radius where the toolbar needs it.

Keep it that way: if a component needs a different look, wrap it or pass
classes from the call site rather than editing these files, so a future
upstream update is a copy-and-diff rather than a merge.
