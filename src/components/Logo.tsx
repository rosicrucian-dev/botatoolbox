import clsx from 'clsx'

import { CubeMark } from '@/components/CubeMark'

// Mark + wordmark lockup, used in the desktop sidebar and the mobile
// top bar. The cube is sized in em so it tracks the text if the
// wordmark ever changes size.
export function Logo({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-white',
      )}
    >
      <CubeMark className="h-[1.2em]" />
      BOTA Toolbox
    </span>
  )
}
