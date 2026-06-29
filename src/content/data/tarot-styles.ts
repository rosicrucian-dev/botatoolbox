// The selectable tarot art styles, per arcana. This registry is the single
// source of truth: it drives the Settings dropdowns, the image helpers (which
// directory a card image lives in), and the Files downloads. Adding a style is
// a one-line edit here plus dropping its image directory under
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
  // Major thumbnails differ slightly in crop height between styles; carried
  // here so the tableau reserves the right space. Minor styles omit it.
  thumbHeight?: number
}

export const MAJOR_STYLES: ReadonlyArray<TarotStyle> = [
  { id: 'traditional', label: 'Traditional', thumbHeight: 600 },
  { id: 'modern', label: 'Modern', thumbHeight: 635 },
]

export const MINOR_STYLES: ReadonlyArray<TarotStyle> = [
  { id: 'josh-yates', label: 'Josh Yates' },
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
export function majorThumbHeight(id: string): number {
  return MAJOR_STYLES.find((s) => s.id === id)?.thumbHeight ?? 600
}
