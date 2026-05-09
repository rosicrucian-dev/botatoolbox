'use client'

import { useEffect, useState } from 'react'

import { PlayerHeader } from '@/components/PlayerHeader'

function ArrowIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.5 6.5 3 3.5m0 0-3 3.5m3-3.5h-9"
      />
    </svg>
  )
}

export interface Slide {
  bgColor?: string | null
  textColor?: string | null
  label?: string | null
}

interface SlidePlayerProps<S extends Slide> {
  title: string
  slides: Array<S>
  idx: number
  onIdxChange: (idx: number) => void
  onClose: () => void
  renderLeft: (slide: S, idx: number) => React.ReactNode
  renderRight: (slide: S, idx: number) => React.ReactNode
  extraHeaderItem?: React.ReactNode
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
  extraHeaderItem,
}: SlidePlayerProps<S>) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't hijack keys that the user is typing into a form field or
      // pressing with a modifier (cmd-tab, etc.).
      const target = e.target as HTMLElement | null
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      )
        return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
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
  const [primed, setPrimed] = useState(false)
  useEffect(() => {
    let raf2: number | undefined
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPrimed(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  function onMainClick(e: React.MouseEvent) {
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
        className="flex flex-1 cursor-pointer flex-col pb-2 select-none lg:px-2"
      >
        <div className="flex min-h-0 grow flex-col p-6 lg:p-10">
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-stretch justify-center">
            {current && (
              <div className="flex w-full max-w-4xl flex-col items-center gap-4 md:h-auto md:flex-row md:items-center md:gap-16">
                <div className="flex h-[35svh] w-full items-center justify-center overflow-hidden md:h-auto md:flex-1">
                  {renderLeft(current, idx)}
                </div>
                <div className="flex h-[35svh] w-full items-center justify-center overflow-hidden md:h-auto md:flex-1">
                  {renderRight(current, idx)}
                </div>
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-6xl">
            <nav className="flex">
              {idx > 0 ? (
                <div className="flex flex-col items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onIdxChange(idx - 1)}
                    aria-label={`Previous${slides[idx - 1].label ? `: ${slides[idx - 1].label}` : ''}`}
                    className="inline-flex items-center justify-center gap-0.5 overflow-hidden rounded-full bg-current/10 px-3 py-1 text-sm font-medium ring-1 ring-current/10 ring-inset transition hover:bg-current/15"
                  >
                    <ArrowIcon className="-ml-1 mt-0.5 h-5 w-5 rotate-180" />
                    <span>Previous</span>
                  </button>
                  {slides[idx - 1].label && (
                    <span
                      aria-hidden="true"
                      className="text-base font-semibold"
                    >
                      {slides[idx - 1].label}
                    </span>
                  )}
                </div>
              ) : null}
              {idx < slides.length - 1 ? (
                <div className="ml-auto flex flex-col items-end gap-3">
                  <button
                    type="button"
                    onClick={() => onIdxChange(idx + 1)}
                    aria-label={`Next${slides[idx + 1].label ? `: ${slides[idx + 1].label}` : ''}`}
                    className="inline-flex items-center justify-center gap-0.5 overflow-hidden rounded-full bg-current/10 px-3 py-1 text-sm font-medium ring-1 ring-current/10 ring-inset transition hover:bg-current/15"
                  >
                    <span>Next</span>
                    <ArrowIcon className="-mr-1 mt-0.5 h-5 w-5" />
                  </button>
                  {slides[idx + 1].label && (
                    <span
                      aria-hidden="true"
                      className="text-base font-semibold"
                    >
                      {slides[idx + 1].label}
                    </span>
                  )}
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      </main>
    </div>
  )
}
