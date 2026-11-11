// Cells several correspondence tables draw the same way.
//
// They were local to the one Astrology page until 10 November 2026,
// when that page became Signs, Planets and Houses — three pages that
// each want them.

import { TextLink } from '@/components/ui/TextLink'

/** A cell with nothing in it: the fact is absent, not missing. */
export function Dash() {
  return <span className="text-zinc-400 dark:text-zinc-600">—</span>
}

// A comma-separated list of cross-links (rulers, exaltation). Each link
// is positioned `relative` so it sits above the clickable-row overlay
// and stays independently clickable.
export function LinkList({
  items,
  hrefBase,
}: {
  items: Array<{ slug: string; name: string }>
  hrefBase: string
}) {
  if (items.length === 0) return <Dash />
  return (
    <>
      {items.map((item, i) => (
        <span key={item.slug}>
          <TextLink href={`${hrefBase}/${item.slug}`} className="relative">
            {item.name}
          </TextLink>
          {i < items.length - 1 ? ', ' : null}
        </span>
      ))}
    </>
  )
}

/** 1 → "1st", 2 → "2nd", 11 → "11th". */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}
