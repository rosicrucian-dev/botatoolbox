// Helpers for the <meta name="theme-color"> pair in layout.tsx.
//
// The UI follows the system color scheme (no toggle), so the two
// media-keyed metas are normally all the browser needs. These helpers
// exist for the SlidePlayer, which mirrors the current slide's color
// into theme-color while a player is open: standalone iOS derives the
// status-bar backing and the color of any webview-sizing gap from it,
// so matching the slide makes those OS-owned regions blend in. On
// close, the player restores the scheme-appropriate resting color.

// Matches the body background in layout.tsx (white / zinc-900).
export const THEME_COLORS = {
  light: '#ffffff',
  dark: '#18181b',
} as const

// Rewrites every theme-color meta (there are two, media-keyed — see
// layout.tsx).
export function setThemeColorMeta(color: string) {
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((el) => el.setAttribute('content', color))
}

// The scheme-appropriate resting color. The system scheme IS the theme,
// so prefers-color-scheme is the source of truth.
export function themeColorForCurrentTheme(): string {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEME_COLORS.dark
    : THEME_COLORS.light
}
