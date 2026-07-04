'use client'

import { useEffect, useRef, useState } from 'react'

// First-click hint for iOS users: web audio is silenced when Silent
// Mode / a Focus mute is active, and there's no JS API to detect that —
// users just hear nothing and assume the button is broken. So on iOS
// we show a small popover under the button on the first tap, explaining
// the iOS-specific gotcha. Dismissal persists in localStorage so we
// don't nag a returning user. Non-iOS browsers never see the hint.
//
// On iOS 17+ the hint is skipped entirely: audioContext.ts sets
// `navigator.audioSession.type = 'playback'`, which plays through the
// Silent Mode switch — the gotcha the hint warned about no longer exists.

const HINT_KEY = 'sound-button-ios-hint-dismissed'
const HINT_DURATION_MS = 7000

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports as MacIntel — disambiguate by touch points.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

// Replays the current slide's tone. Chip-styled to sit alongside the
// PlayerHeader's close button (and FlowToggle on the cube view). Uses
// current-color ring/hover so it works on any slide background.
export function SoundButton({ onClick }: { onClick: () => void }) {
  // dismissed starts true so the hint never flashes during SSR / first
  // paint. The effect below corrects it after mount on iOS.
  const [dismissed, setDismissed] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isIOS() || 'audioSession' in navigator) return
    try {
      const stored = localStorage.getItem(HINT_KEY)
      setDismissed(stored === '1')
    } catch {
      // Storage disabled — leave dismissed=true so we don't nag.
    }
  }, [])

  function markDismissed() {
    setShowHint(false)
    setDismissed(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    try {
      localStorage.setItem(HINT_KEY, '1')
    } catch {}
  }

  function handleClick() {
    onClick()
    if (!dismissed && !showHint) {
      setShowHint(true)
      timerRef.current = setTimeout(markDismissed, HINT_DURATION_MS)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Play tone"
        className="relative inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm ring-1 ring-current/20 transition hover:bg-current/10"
      >
        <span className="absolute size-12 pointer-fine:hidden" />
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
          />
        </svg>
      </button>
      {showHint && (
        <div
          role="status"
          aria-live="polite"
          // Anchored to the viewport's right edge with the same
          // responsive inset as PlayerHeader's px-* — so its right edge
          // lines up with the close button's right edge, not the play
          // button's. Top sits below the safe-area + header height.
          style={{ top: 'calc(env(safe-area-inset-top) + 4rem)' }}
          className="fixed right-4 z-50 w-64 rounded-md bg-zinc-900 p-3 text-xs leading-snug text-white shadow-lg ring-1 ring-zinc-700 sm:right-6 lg:right-8 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-300"
        >
          <button
            type="button"
            onClick={markDismissed}
            aria-label="Dismiss"
            className="absolute top-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded text-base leading-none opacity-70 hover:opacity-100"
          >
            ×
          </button>
          <p className="pr-4">
            Don&apos;t hear anything? Check that Silent Mode and Do Not Disturb
            are both off.
          </p>
        </div>
      )}
    </div>
  )
}
