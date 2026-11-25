'use client'

import { Link } from '@/components/locale/LocaleLink'
import { useTarotStyle } from '@/lib/stores/tarotStyle'

// The artist's credit under a minor card, shown only for the style that needs
// one: the Josh Yates minors are his, used with permission. The other minor
// styles are the site's own and carry no credit line.
export function MinorCredit() {
  const { minorStyle } = useTarotStyle()
  if (minorStyle !== 'josh-yates') return null
  return (
    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
      Image provided by&nbsp;
      <Link
        href="https://joshyates.me/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Josh Yates
      </Link>
      .
    </p>
  )
}
