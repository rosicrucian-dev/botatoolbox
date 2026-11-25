// Pins a Catalyst `<Button>` to its compact (desktop) size at every breakpoint,
// so the buttons in a page title row — the emerald Expand/Play buttons in
// tree-of-life, cube-of-space, freeform and gematria, and Radio on Recordings —
// line up with the 36px controls beside them (HeaderChip, FlowToggle, Tabs,
// PlayLink, CollectionSearch) on mobile.
//
// Catalyst's Button deliberately grows on mobile (taller `py`, 16px text) for
// comfortable standalone actions — right there (e.g. the Settings permalink
// buttons), but wrong next to a fixed-height chip row, where it reads as an
// oversized outlier. We override only the size-driving utilities and leave the
// shared Button component untouched. The `!` keeps these winning over Button's
// own base classes regardless of stylesheet order; TouchTarget still guarantees
// a 44px touch hit-area underneath.
//
// Size only. The radius is Catalyst's own rounded-lg, the one shape every
// action button and toolbar control uses (see Conventions in CONTRIBUTING.md).
export const toolbarButtonSize =
  'text-sm/6! px-[calc(--spacing(3)-1px)]! py-[calc(--spacing(1.5)-1px)]!'
