'use client'

import { Link } from 'next-view-transitions'
import { type ReactNode } from 'react'

import { useMediaQuery } from '@/lib/useMediaQuery'

// The card image's tap target changes meaning with the layout. On wide
// screens (side-by-side columns) it links to the full-size image view —
// the image is small there, so "see it big" is the natural tap. When the
// layout is collapsed the image is already full width, so that tap is
// dead weight; it becomes "next card" instead, pairing with the swipe
// gesture. The breakpoint matches CardStack's md collapse. SSR renders
// the desktop link; the media query settles it after mount.
export function CardImageLink({
  imageHref,
  nextHref,
  children,
}: {
  imageHref: string
  nextHref: string
  children: ReactNode
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)', true)
  return (
    <Link
      href={isDesktop ? imageHref : nextHref}
      aria-label={isDesktop ? 'View the full-size card image' : 'Next card'}
      className="block transition hover:opacity-90"
    >
      {children}
    </Link>
  )
}
