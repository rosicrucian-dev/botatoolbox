'use client'

import Link from 'next/link'

import { ensureAudioContext } from '@/lib/audioContext'

// "Play ▶" link that primes the AudioContext inside the click handler so
// the destination route can use audio without a user-gesture problem.
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
      onClick={() => ensureAudioContext()}
      className={
        className ??
        'shrink-0 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400'
      }
    >
      {children}
    </Link>
  )
}
