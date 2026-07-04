export function IndexLabel({
  children,
  // Width utilities for the label column. Defaults suit numeric indices
  // (0–21, verse numbers). Callers whose labels are words — e.g. Minor
  // Arcana's "Page"/"Knight"/"Queen" — pass a wider value so the text
  // isn't squished.
  widthClassName = 'w-8 md:w-12',
}: {
  children: React.ReactNode
  widthClassName?: string
}) {
  return (
    <span
      className={`${widthClassName} shrink-0 text-sm font-medium text-zinc-500 tabular-nums dark:text-zinc-400`}
    >
      {children}
    </span>
  )
}
