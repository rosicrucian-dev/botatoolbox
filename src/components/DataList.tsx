import { Link } from '@/components/LocaleLink'
import clsx from 'clsx'

import { PlayLink } from './PlayLink'

// The dominant list-page pattern in the app: a divided <ul> of clickable
// rows, each linking to a detail page. Most rows are flex(name | glyph),
// so `default` covers them; pages with multi-line content (e.g. Words of
// Power's two-line left side) pass their own `rowClassName`.

const DEFAULT_ROW =
  '-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50'

export interface DataListProps<T> {
  items: ReadonlyArray<T>
  // Callbacks also receive the item's index — use it when items alone
  // aren't unique (e.g. a word's letters, where a letter can repeat).
  getKey: (item: T, index: number) => string
  getHref: (item: T, index: number) => string
  renderRow: (item: T, index: number) => React.ReactNode
  // Set for rows that navigate into a full-screen player: the click
  // handler primes the AudioContext (iOS unlocks audio in-gesture) and
  // requests true fullscreen on touch devices (lib/playerFullscreen.ts).
  player?: boolean
  // Override the default row container styling. Use when the row needs
  // multi-line layout or padding outside the default.
  rowClassName?: string
  // Extra classes for the <ul> (top border, margins, …).
  className?: string
}

export function DataList<T>({
  items,
  getKey,
  getHref,
  renderRow,
  player = false,
  rowClassName,
  className,
}: DataListProps<T>) {
  const Anchor = player ? PlayLink : Link
  const cls = rowClassName ?? DEFAULT_ROW
  return (
    <ul
      className={clsx(
        'divide-y divide-zinc-200 dark:divide-zinc-800',
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={getKey(item, i)}>
          <Anchor href={getHref(item, i)} className={cls}>
            {renderRow(item, i)}
          </Anchor>
        </li>
      ))}
    </ul>
  )
}
