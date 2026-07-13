// The visual contract for the paced-breath circle: the scale/opacity
// extremes between the fully-exhaled and fully-inhaled states. This is the
// single source of truth for the *look* of a breath circle, independent of
// what drives it (a JS rAF clock in <BreathCircle> / useBreathSequence, or
// the CSS `@keyframes breathe` box-breath used by the Healing/Planets
// player). The CSS keyframe in `src/styles/tailwind.css` mirrors these
// numbers by hand — a static @keyframes can't import TS — so if you change
// them here, update that keyframe (and its reduced-motion override) to match.
export const BREATH_MIN_SCALE = 0.4 // fully exhaled
export const BREATH_MAX_SCALE = 1 // fully inhaled
export const BREATH_MIN_OPACITY = 0.2
export const BREATH_MAX_OPACITY = 0.45

// A segment's target opacity follows its target scale: expanded (inhaled)
// reads brighter, contracted (exhaled) dimmer.
export const opacityForScale = (scale: number): number =>
  scale >= BREATH_MAX_SCALE ? BREATH_MAX_OPACITY : BREATH_MIN_OPACITY
