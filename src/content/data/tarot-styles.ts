// The selectable tarot art styles, per arcana. This registry is the single
// source of truth: it drives the Settings dropdowns, the image helpers (which
// directory a card image lives in), the Files downloads, and the canonical
// aspect ratio each style's art is displayed at. Adding a style is a one-line
// edit here plus dropping its image directory under
// public/tarot/<arcana>/<id>/.
//
// Directory layout:
//   public/tarot/major/<style>/<num>-<slug>.jpg   (+ <style>/thumbs/…)
//   public/tarot/minor/<style>/<slug>.jpg
//
// Dependency-free on purpose (no imports) so it can be shared by the data
// helpers, the persisted store, the Settings page, and the Files registry
// without coupling any of them together.

export interface TarotStyle {
  id: string
  label: string
  // Canonical art aspect ratio, expressed as CSS width / height. Every card of
  // a style shares it so cards line up wherever they're shown together — grids,
  // the tableau, and the freeform table. The art is authored/normalized to this
  // ratio (Traditional is a native 724×1200; Modern is normalized to
  // 1400×2436; Josh Yates minors are a native 270×466).
  aspectRatio: number
}

// Width of the rendered card thumbnail, in px. Used to derive thumb heights
// from each style's aspect ratio (matches THUMB_WIDTH in scripts/optimize-tarot).
const THUMB_WIDTH = 362

export const MAJOR_STYLES: ReadonlyArray<TarotStyle> = [
  { id: 'traditional', label: 'Traditional', aspectRatio: 724 / 1200 },
  { id: 'modern', label: 'Modern', aspectRatio: 1400 / 2436 },
]

export const MINOR_STYLES: ReadonlyArray<TarotStyle> = [
  { id: 'josh-yates', label: 'Josh Yates', aspectRatio: 270 / 466 },
]

// Default major style shown to users with no saved preference (and baked into
// the static export). Modern is the current default; the dropdown still lists
// both in registry order. Resolved against the registry so a stale id can't
// silently point at a removed style — it falls back to the first registered.
const PREFERRED_MAJOR_STYLE = 'modern'
export const DEFAULT_MAJOR_STYLE =
  MAJOR_STYLES.find((s) => s.id === PREFERRED_MAJOR_STYLE)?.id ?? MAJOR_STYLES[0].id
export const DEFAULT_MINOR_STYLE = MINOR_STYLES[0].id

export function isMajorStyle(id: string): boolean {
  return MAJOR_STYLES.some((s) => s.id === id)
}
export function isMinorStyle(id: string): boolean {
  return MINOR_STYLES.some((s) => s.id === id)
}

// Canonical aspect ratio (CSS width / height) for a major / minor style. Used
// to size card frames consistently — grids, the tableau, and the freeform
// table. Falls back to the first registered style for an unknown id.
export function majorAspectRatio(id: string): number {
  return MAJOR_STYLES.find((s) => s.id === id)?.aspectRatio ?? MAJOR_STYLES[0].aspectRatio
}
export function minorAspectRatio(id: string): number {
  return MINOR_STYLES.find((s) => s.id === id)?.aspectRatio ?? MINOR_STYLES[0].aspectRatio
}

// Rendered thumbnail height (px) at THUMB_WIDTH for a major style — the tableau
// uses it to reserve layout space. Derived from the style's aspect ratio so
// there's one source of truth.
export function majorThumbHeight(id: string): number {
  return Math.round(THUMB_WIDTH / majorAspectRatio(id))
}
