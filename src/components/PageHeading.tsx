import clsx from 'clsx'

// The standard page <h1>. Nearly every docs page (and several players)
// renders exactly this style — keep it here so a heading restyle is a
// one-file edit. Pass className for the rare size/spacing tweak.
//
// By default the title wraps normally (a long title on a plain page — e.g.
// a text — flows onto a second line). Pass `truncate` on the rows where a
// toolbar shares the line with the title: it keeps the title to one line
// and ellipsizes it (e.g. "Cube of Space" → "Cube of Sp…") so the title
// shrinks instead of wrapping or pushing the toolbar to a second line —
// replacing the old per-page mobile/short-title and hide-on-mobile hacks.
export function PageHeading({
  className,
  truncate,
  children,
}: {
  className?: string
  truncate?: boolean
  children: React.ReactNode
}) {
  return (
    <h1
      className={clsx(
        'text-3xl font-semibold tracking-tight dark:text-white',
        truncate && 'min-w-0 truncate',
        className,
      )}
    >
      {children}
    </h1>
  )
}
