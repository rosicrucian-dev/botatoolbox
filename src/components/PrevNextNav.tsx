import Link from 'next/link'

export interface PrevNextLink {
  href: string
  label: string
}

// Shared prev/next nav for detail pages — two-line text links (label
// stack: "← Previous" on top, page name below; "Next →" mirrored on
// the right). Replaces the older Button-based variant used across
// tarot, sephirah, sign, planet, meditation pages so they all read the
// same. Empty side renders as a spacer so the present side still hugs
// its edge.
export function PrevNextNav({
  prev,
  next,
  ariaLabel = 'Page navigation',
}: {
  prev?: PrevNextLink
  next?: PrevNextLink
  ariaLabel?: string
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col items-start gap-1 text-sm transition hover:text-zinc-600 dark:hover:text-zinc-400"
        >
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            ← Previous
          </span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {prev.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 text-sm transition hover:text-zinc-600 dark:hover:text-zinc-400"
        >
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Next →
          </span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {next.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
