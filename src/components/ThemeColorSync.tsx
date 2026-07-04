'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

// Matches the body background in layout.tsx (white / zinc-900).
export const THEME_COLORS = {
  light: '#ffffff',
  dark: '#18181b',
} as const

// Rewrites every theme-color meta (there are two, media-keyed — see
// layout.tsx). Also used by SlidePlayer, which mirrors the slide color
// into theme-color while a player is open: standalone iOS derives the
// status-bar backing and the color of any webview-sizing gap from it,
// so matching the slide makes those OS-owned regions blend in.
export function setThemeColorMeta(color: string) {
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((el) => el.setAttribute('content', color))
}

// The theme-appropriate resting color, from the live root class (the
// source of truth next-themes maintains).
export function themeColorForCurrentTheme(): string {
  return document.documentElement.classList.contains('dark')
    ? THEME_COLORS.dark
    : THEME_COLORS.light
}

// The static `viewport.themeColor` metas in layout.tsx are keyed to
// `prefers-color-scheme`, but the theme toggle can override the system
// scheme (next-themes flips the .dark class independently). When that
// happens the browser chrome would tint to the system scheme while the
// page renders the other one. This rewrites both metas to the resolved
// theme's color, so whichever media query the browser picks, it gets
// the color that matches what's actually on screen.
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return
    setThemeColorMeta(THEME_COLORS[resolvedTheme])
  }, [resolvedTheme])

  return null
}
