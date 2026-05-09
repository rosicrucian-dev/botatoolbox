'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Wires ArrowLeft / ArrowRight to a prev/next href via the router. Renders
// nothing — drop it on any page that has prev/next nav. Ignores key presses
// originating from inputs, contenteditables, or with modifier keys (so
// search and form fields keep working normally).
export function KeyboardNav({
  prevHref,
  nextHref,
}: {
  prevHref?: string
  nextHref?: string
}) {
  const router = useRouter()
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      )
        return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (e.key === 'ArrowLeft' && prevHref) {
        e.preventDefault()
        router.push(prevHref)
      } else if (e.key === 'ArrowRight' && nextHref) {
        e.preventDefault()
        router.push(nextHref)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevHref, nextHref, router])
  return null
}
