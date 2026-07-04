import clsx from 'clsx'

// The standard page <h1>. Nearly every docs page (and several players)
// renders exactly this style — keep it here so a heading restyle is a
// one-file edit. Pass className for the rare size/spacing tweak.
export function PageHeading({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <h1
      className={clsx(
        'text-3xl font-semibold tracking-tight dark:text-white',
        className,
      )}
    >
      {children}
    </h1>
  )
}
