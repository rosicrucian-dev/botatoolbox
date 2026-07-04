'use client'

import { useEffect, useState } from 'react'

import { PlayerHeader } from '@/components/PlayerHeader'
import {
  setThemeColorMeta,
  themeColorForCurrentTheme,
} from '@/components/ThemeColorSync'
import { usePlayerFullscreenExit } from '@/lib/playerFullscreen'
import { usePlayerScrollLock } from '@/lib/usePlayerScrollLock'
import { useWakeLock } from '@/lib/useWakeLock'

// True once any SlidePlayer instance has finished priming this session.
// See the `primed` state inside the component for why this is module-level.
let sessionPrimed = false

export interface Slide {
  bgColor?: string | null
  textColor?: string | null
  label?: string | null
}

interface SlidePlayerProps<S extends Slide> {
  title: string
  slides: ReadonlyArray<S>
  idx: number
  onIdxChange: (idx: number) => void
  onClose: () => void
  renderLeft: (slide: S, idx: number) => React.ReactNode
  renderRight: (slide: S, idx: number) => React.ReactNode
  // Per-slide opt-out from the left/right split. When this returns a
  // non-null value for a slide, it replaces both halves and fills the
  // content area centered. Useful for end-of-quiz summary screens etc.
  renderFull?: (slide: S, idx: number) => React.ReactNode
  extraHeaderItem?: React.ReactNode
  // Opt out of the default "click anywhere to advance" behavior. Use for
  // players whose right pane is interactive (typing, inline controls),
  // where a stray click should not jump to the next slide.
  disableClickToAdvance?: boolean
}

// Route-based slide player. Owns full-screen chrome (header + halves +
// bottom nav) and per-slide background/text colors. The parent route
// owns idx state and the slide list. iOS black-flash priming on mount
// locks the toolbars to black for the session.
export function SlidePlayer<S extends Slide>({
  title,
  slides,
  idx,
  onIdxChange,
  onClose,
  renderLeft,
  renderRight,
  renderFull,
  extraHeaderItem,
  disableClickToAdvance = false,
}: SlidePlayerProps<S>) {
  // Meditation slides are looked at, not touched — keep the screen on.
  useWakeLock()

  // If the entry tap put us in true fullscreen, leave it on close.
  usePlayerFullscreenExit()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Pass through modifier-key combos (cmd-tab, etc.).
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return

      // When the focus is in a form field, normally don't hijack keys —
      // the user is typing. Exception for text inputs: a horizontal
      // arrow at the field's edge in the direction of travel (and with
      // no active selection) falls through to slide nav, so the user
      // can step between slides without leaving the input. An empty
      // input satisfies this naturally — both edges are at position 0.
      const target = e.target as HTMLElement | null
      const isTextInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      const isOtherFormField =
        target instanceof HTMLSelectElement || target?.isContentEditable
      if (isOtherFormField) return
      if (isTextInput) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        const { selectionStart, selectionEnd, value } = target
        if (selectionStart === null || selectionEnd === null) return
        // Active selection — let the browser collapse it.
        if (selectionStart !== selectionEnd) return
        if (e.key === 'ArrowLeft' && selectionStart !== 0) return
        if (e.key === 'ArrowRight' && selectionEnd !== value.length) return
        // Cursor is at the edge in the arrow's direction — fall through
        // to the nav handler below.
      }

      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && idx > 0) onIdxChange(idx - 1)
      else if (e.key === 'ArrowRight' && idx < slides.length - 1)
        onIdxChange(idx + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, slides.length, onIdxChange, onClose])

  // After two animation frames, mark the shell primed. The CSS rule that
  // forces a black bg on iOS (in tailwind.css) only matches `:not([data-primed])`,
  // so first paint is black on iOS — letting the toolbar lock to black —
  // and the slide bg appears once primed. Desktop never sees the override.
  //
  // `sessionPrimed` is module-level so the prime-once-per-session model
  // survives SlidePlayer remounts. Without this, Astrology Focus (which
  // uses router.replace between slides) re-fires the black flash every
  // time the URL slug changes — visible noise on each next/prev tap.
  // The iOS toolbar tint is already locked from the first prime; nothing
  // else needs re-priming.
  const [primed, setPrimed] = useState(sessionPrimed)
  useEffect(() => {
    if (sessionPrimed) return
    let raf2: number | undefined
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setPrimed(true)
        sessionPrimed = true
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  // iOS standalone-mode bugfix: pre-paint scroll reset + hard body
  // lock. Full diagnosis lives with the hook.
  usePlayerScrollLock()

  // While mounted, paint the document canvas (html background) to match
  // the shell. In standalone iOS the root canvas shows through wherever
  // the layout viewport doesn't cover the physical screen — the
  // home-indicator strip, plus the gap iOS 26/27 betas sometimes expose
  // by mis-positioning the standalone viewport after in-app navigation.
  // Left alone the canvas is white in light mode, which reads as a white
  // band under the player. Pre-prime it's black to match the iOS toolbar
  // lock; slides without a bgColor leave the canvas untouched so it keeps
  // matching the shell's white/zinc fallback classes.
  const canvasBg = primed ? (slides[idx]?.bgColor ?? null) : 'black'
  useEffect(() => {
    if (canvasBg == null) return
    const html = document.documentElement
    const prev = html.style.background
    html.style.background = canvasBg
    // Mirror the slide color into <meta name="theme-color"> too. In a
    // standalone home-screen app, iOS paints the OS-owned regions —
    // the status-bar backing and the gap left when the iOS 26/27 beta
    // sizes the webview short — from theme-color, not from anything CSS
    // can reach. Matching it to the slide makes those regions blend
    // (yellow slide → yellow island surround) instead of flashing the
    // page-theme white/black.
    setThemeColorMeta(canvasBg)
    return () => {
      html.style.background = prev
      setThemeColorMeta(themeColorForCurrentTheme())
    }
  }, [canvasBg])

  function onMainClick(e: React.MouseEvent) {
    if (disableClickToAdvance) return
    const target = e.target as HTMLElement
    if (target.closest('button, a')) return
    if (idx < slides.length - 1) onIdxChange(idx + 1)
    else onClose()
  }

  const current = slides[idx]
  const hasBg = !!current?.bgColor
  const hasText = !!current?.textColor
  const inlineStyle: React.CSSProperties = {
    ...(hasBg ? { background: current!.bgColor as string } : null),
    ...(hasText ? { color: current!.textColor as string } : null),
  }
  const fallbackClasses = [
    hasBg ? '' : 'bg-white dark:bg-zinc-900',
    hasText ? '' : 'text-zinc-900 dark:text-zinc-100',
  ].join(' ')

  // Pin the shell to all four viewport edges rather than measuring a
  // `height: 100svh`. `inset: 0` lets the browser hold the height as a
  // constraint (top + bottom pinned), which sidesteps iOS standalone's
  // flaky small-viewport-height math — a stale `svh` was rendering the
  // shell shorter than the screen, exposing a black band at the bottom.
  // Identical result on desktop, so it isn't gated to mobile.
  const safeAreaStyle: React.CSSProperties = {
    // --player-top-breather (tailwind.css): a small extra gap below the
    // Dynamic Island in standalone mode; 0 in a browser.
    paddingTop: 'calc(env(safe-area-inset-top) + var(--player-top-breather, 0px))',
    paddingBottom: 'env(safe-area-inset-bottom)',
  }

  return (
    <div
      data-primed={primed ? '' : undefined}
      className={`player-shell fixed inset-0 z-50 flex flex-col transition-colors duration-200 ${fallbackClasses}`}
      style={{ ...safeAreaStyle, ...inlineStyle }}
    >
      <PlayerHeader
        title={title}
        onClose={onClose}
        extraHeaderItem={extraHeaderItem}
      />

      <main
        onClick={onMainClick}
        className={`flex flex-1 flex-col pb-2 select-none lg:px-2 ${
          disableClickToAdvance ? '' : 'cursor-pointer'
        }`}
      >
        <div className="flex min-h-0 grow flex-col p-6 lg:p-10">
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-stretch justify-center">
            {current &&
              (() => {
                const full = renderFull?.(current, idx)
                if (full != null) {
                  return (
                    <div className="flex w-full max-w-4xl items-center justify-center">
                      {full}
                    </div>
                  )
                }
                return (
                  <div className="flex w-full max-w-4xl flex-col items-center gap-4 md:h-auto md:flex-row md:items-center md:gap-16">
                    <div className="flex h-[35svh] w-full items-center justify-center overflow-hidden md:h-auto md:flex-1">
                      {renderLeft(current, idx)}
                    </div>
                    <div className="flex h-[35svh] w-full items-center justify-center overflow-hidden md:h-auto md:flex-1">
                      {renderRight(current, idx)}
                    </div>
                  </div>
                )
              })()}
          </div>

          <div className="mx-auto w-full max-w-6xl">
            {/* Text-link prev/next, same shape as PrevNextNav but
                button-based (SlidePlayer drives idx by callback, not
                routing) and current-color so it adapts to the slide's
                background. */}
            <nav
              aria-label="Slide navigation"
              className="flex items-center justify-between gap-4 border-t border-current/15 pt-6"
            >
              {idx > 0 ? (
                <button
                  type="button"
                  onClick={() => onIdxChange(idx - 1)}
                  aria-label={`Previous${slides[idx - 1].label ? `: ${slides[idx - 1].label}` : ''}`}
                  className="group flex flex-col items-start gap-1 text-sm transition hover:opacity-70"
                >
                  <span className="text-xs font-medium opacity-70">
                    ← Previous
                  </span>
                  {slides[idx - 1].label && (
                    <span className="font-medium">{slides[idx - 1].label}</span>
                  )}
                </button>
              ) : (
                <span />
              )}
              {idx < slides.length - 1 ? (
                <button
                  type="button"
                  onClick={() => onIdxChange(idx + 1)}
                  aria-label={`Next${slides[idx + 1].label ? `: ${slides[idx + 1].label}` : ''}`}
                  className="group flex flex-col items-end gap-1 text-sm transition hover:opacity-70"
                >
                  <span className="text-xs font-medium opacity-70">Next →</span>
                  {slides[idx + 1].label && (
                    <span className="font-medium">{slides[idx + 1].label}</span>
                  )}
                </button>
              ) : (
                <span />
              )}
            </nav>
          </div>
        </div>
      </main>
    </div>
  )
}
