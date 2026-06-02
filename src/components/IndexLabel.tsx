export function IndexLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-8 shrink-0 text-sm font-medium tabular-nums text-zinc-500 md:w-12 dark:text-zinc-400">
      {children}
    </span>
  )
}
