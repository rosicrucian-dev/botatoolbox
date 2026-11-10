'use client'

import { useEffect } from 'react'

import {
  PlainLink as Link,
  useLocaleRouter,
} from '@/components/locale/LocaleLink'

// /keyboard IS the piano — it always rendered it, and /keyboard/piano
// was a second address for the same view, left over from when the tab
// links pointed at two nested routes. The keyboard is a tool like the
// other two now (src/lib/tools.ts), and a tool's views are one address
// each. The static export can't emit real 301s, so this stub keeps old
// bookmarks working with a client-side redirect.
export default function KeyboardPianoRedirect() {
  const router = useLocaleRouter()
  useEffect(() => {
    router.replace('/keyboard')
  }, [router])
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      The piano has moved to{' '}
      <Link
        href="/keyboard"
        className="text-emerald-500 underline hover:text-emerald-600"
      >
        /keyboard
      </Link>
      .
    </p>
  )
}
