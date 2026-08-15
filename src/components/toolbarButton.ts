// Pins a Catalyst `<Button>` to its compact (desktop) size at every breakpoint,
// so the primary toolbar actions — the emerald Expand/Play buttons in
// tree-of-life, cube-of-space, freeform and gematria — line up with the bespoke
// h-9 toolbar chips (HeaderChip/FlowToggle) on mobile.
//
// Catalyst's Button deliberately grows on mobile (taller `py`, 16px text) for
// comfortable standalone form actions — right there (e.g. the Settings Unlock
// form), but wrong next to a fixed-height chip row, where it reads as an
// oversized outlier. We override only the size-driving utilities and leave the
// shared Button component untouched. The `!` keeps these winning over Button's
// own base classes regardless of stylesheet order; TouchTarget still guarantees
// a 44px touch hit-area underneath.
//
// Also pins the squared radius (rounded-lg). The Catalyst base is now
// rounded-full (Protocol's default for content buttons), but toolbar buttons
// read better squared-off and match the HeaderChip row beside them. Catalyst
// paints the fill/hover on inset `before`/`after` pseudo-layers, so those are
// pinned too or the fill wouldn't match the squared outline.
export const toolbarButtonSize =
  'text-sm/6! px-[calc(--spacing(3)-1px)]! py-[calc(--spacing(1.5)-1px)]! rounded-lg! before:rounded-lg! after:rounded-lg!'
