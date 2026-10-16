// Shared keypad styling for the two gematria tools, so the calculator's
// Hebrew keyboard and the dictionary's number pad stay visually in
// lockstep. Each client keeps its own key component (sizing and glyph
// treatment differ); the tile chrome and the action-row buttons live here.

export const keypadTileClass =
  'flex items-center justify-center rounded-md bg-zinc-100 ring-1 ring-zinc-900/5 transition hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:ring-white/10 dark:hover:bg-zinc-700 dark:active:bg-zinc-600'

export function GematriaActionKey({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-900/5 transition hover:bg-zinc-200 active:bg-zinc-300 md:text-base dark:bg-zinc-800 dark:text-white dark:ring-white/10 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 ${className}`}
    >
      {children}
    </button>
  )
}
