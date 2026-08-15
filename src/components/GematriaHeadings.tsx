// Shared headings for the gematria source sections, giving two levels of
// hierarchy: a prominent SourceTitle (Crowley, Strong's, Paul Case …) and, under
// it, one or more SubSections — a muted hint label ("Number 3", "Words") above
// a table of rows.

export function SourceTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-base font-semibold tracking-wide text-zinc-900 uppercase dark:text-white">
      {children}
    </div>
  )
}

export function SubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
        {title}
      </div>
      <ul className="mt-1 divide-y divide-zinc-200 dark:divide-zinc-800">
        {children}
      </ul>
    </div>
  )
}
