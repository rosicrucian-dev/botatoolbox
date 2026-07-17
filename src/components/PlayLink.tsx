'use client'

import { PlainLink as Link } from '@/components/LocaleLink'

import { ensureAudioContext } from '@/lib/audioContext'
import { enterPlayerFullscreen } from '@/lib/playerFullscreen'

// "Play ▶" link that uses the click's user gesture twice before
// navigating: primes the AudioContext (so the destination player can
// use audio) and requests true fullscreen on touch devices (so the
// player mounts chrome-less; see lib/playerFullscreen.ts).
export function PlayLink({
  href,
  children = 'Play ▶',
  className,
}: {
  href: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        ensureAudioContext()
        enterPlayerFullscreen()
      }}
      className={
        className ??
        'shrink-0 rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400'
      }
    >
      {children}
    </Link>
  )
}
