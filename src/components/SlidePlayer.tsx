'use client'

import { useEffect, useState } from 'react'

import { PlayerHeader } from '@/components/PlayerHeader'

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

  // iOS standalone-mode bugfix. When the user navigates from a scrolled
  // docs page into a player, iOS PWAs sometimes anchor `position: fixed`
  // elements to the *scrolled* document position instead of the viewport.
  // Symptom: the player renders shifted upward by the previous scroll
  // amount — top chrome clipped, a black band exposed at the bottom,
  // and the body is non-scrollable so the user can't recover. Safari
  // proper handles this correctly which is why it's standalone-only.
  //
  // Two parts to the fix:
  //   1. Reset the body to scroll-top so "fixed top-0" actually means
  //      viewport-top.
  //   2. Lock body overflow while the player is mounted so iOS keeps
  //      the viewport stable (and so the user can't induce the same
  //      offset by scrolling behind the player).
  useEffect(() => {
    window.scrollTo(0, 0)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

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

  const safeAreaStyle: React.CSSProperties = {
    height: '100svh',
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  }

  return (
    <div
      data-primed={primed ? '' : undefined}
      className={`player-shell fixed inset-x-0 top-0 z-50 flex flex-col transition-colors duration-200 ${fallbackClasses}`}
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
                    <span className="font-medium">
                      {slides[idx - 1].label}
                    </span>
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
                  <span className="text-xs font-medium opacity-70">
                    Next →
                  </span>
                  {slides[idx + 1].label && (
                    <span className="font-medium">
                      {slides[idx + 1].label}
                    </span>
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
