'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Resets scroll to the top on every route change. Next.js App Router's
// default scroll-to-top via <Link> usually handles this, but our
// Navigation wraps Link in headlessui's CloseButton (which closes the
// mobile-nav dialog on click) — and that interaction can race with the
// router's scroll reset. This watches pathname and forces top, which is
// what users expect when clicking into a new page from the sidebar.
//
// Doesn't run on hash navigation (e.g. /docs#section) — Next.js handles
// those itself.
export function ScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
