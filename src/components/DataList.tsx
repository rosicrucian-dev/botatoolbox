import Link from 'next/link'

import { PlayLink } from './PlayLink'

// The dominant list-page pattern in the app: a divided <ul> of clickable
// rows, each linking to a detail page. Most rows are flex(name | glyph),
// so `default` covers them; pages with multi-line content (e.g. Words of
// Power's two-line left side) pass their own `rowClassName`.

const DEFAULT_ROW =
  '-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50'

export interface DataListProps<T> {
  items: ReadonlyArray<T>
  getKey: (item: T) => string
  getHref: (item: T) => string
  renderRow: (item: T) => React.ReactNode
  // Prime the AudioContext inside the click handler — set this for rows
  // that navigate into a slide player (so iOS unlocks audio in-gesture).
  primeAudio?: boolean
  // Override the default row container styling. Use when the row needs
  // multi-line layout or padding outside the default.
  rowClassName?: string
}

export function DataList<T>({
  items,
  getKey,
  getHref,
  renderRow,
  primeAudio = false,
  rowClassName,
}: DataListProps<T>) {
  const Anchor = primeAudio ? PlayLink : Link
  const cls = rowClassName ?? DEFAULT_ROW
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {items.map((item) => (
        <li key={getKey(item)}>
          <Anchor href={getHref(item)} className={cls}>
            {renderRow(item)}
          </Anchor>
        </li>
      ))}
    </ul>
  )
}
