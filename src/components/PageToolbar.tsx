import clsx from 'clsx'
import type { ReactNode } from 'react'

import { PageHeading } from '@/components/PageHeading'

export function PageToolbar({
  title,
  actions,
  primaryAction,
  secondaryActions,
  splitMobileActions,
  className,
  actionsClassName,
  secondaryActionsClassName,
  primaryActionClassName,
}: {
  title: ReactNode
  actions?: ReactNode
  primaryAction?: ReactNode
  secondaryActions?: ReactNode
  splitMobileActions?: boolean
  className?: string
  actionsClassName?: string
  secondaryActionsClassName?: string
  primaryActionClassName?: string
}) {
  if (splitMobileActions) {
    return (
      <div
        className={clsx(
          'flex items-start justify-between gap-4 max-[520px]:gap-3',
          className,
        )}
      >
        <PageHeading truncate>{title}</PageHeading>
        <div
          className={clsx(
            'flex shrink-0 flex-row items-center gap-2 max-[520px]:flex-col max-[520px]:items-end max-[520px]:gap-3',
            actionsClassName,
          )}
        >
          {secondaryActions && (
            <div
              className={clsx(
                'order-1 flex items-center justify-end gap-2 max-[520px]:order-2',
                secondaryActionsClassName,
              )}
            >
              {secondaryActions}
            </div>
          )}
          {primaryAction && (
            <div
              className={clsx(
                'order-2 flex items-center justify-end max-[520px]:order-1',
                primaryActionClassName,
              )}
            >
              {primaryAction}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('flex items-start justify-between gap-4', className)}>
      <PageHeading truncate>{title}</PageHeading>
      <div
        className={clsx('flex shrink-0 items-center gap-2', actionsClassName)}
      >
        {actions ?? (
          <>
            {secondaryActions}
            {primaryAction}
          </>
        )}
      </div>
    </div>
  )
}
