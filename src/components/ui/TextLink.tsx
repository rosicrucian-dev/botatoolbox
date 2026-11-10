import { Link } from '@/components/locale/LocaleLink'
import clsx from 'clsx'

// The standard inline text link for tables, definition rows, and running
// text: inherits the surrounding size, underlines on hover. This is THE
// answer to "how do I style an inline link" — the one exception is
// prose bodies (the typography plugin styles those via <Prose>).
export function TextLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100',
        className,
      )}
    >
      {children}
    </Link>
  )
}
