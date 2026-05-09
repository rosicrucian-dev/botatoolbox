import clsx from 'clsx'

export function Logo({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'inline-flex items-center text-sm font-semibold tracking-tight text-zinc-900 dark:text-white',
      )}
    >
      BOTA Toolbox
    </span>
  )
}
