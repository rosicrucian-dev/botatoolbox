'use client'

// The HeadlessUI dialog + combobox frame shared by the two search dialogs:
// the global title search (SearchDialog) and the full-text collection search
// (CollectionSearchDialog). Owns the backdrop, the panel (with the standalone
// iOS safe-area offset), the combobox and the input row; the callers own the
// query state, the results and how a selection navigates. Kept presentational
// so the two dialogs stay free to differ in what a result *is*.

import {
  Combobox,
  ComboboxInput,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react'
import clsx from 'clsx'

export function SearchIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.01 12a4.25 4.25 0 1 0-6.02-6 4.25 4.25 0 0 0 6.02 6Zm0 0 3.24 3.25"
      />
    </svg>
  )
}

export function SearchDialogShell<T>({
  open,
  onClose,
  onSelect,
  query,
  onQueryChange,
  placeholder,
  ariaLabel,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  /** Called with the chosen result (the ComboboxOption `value`). */
  onSelect: (value: T) => void
  query: string
  onQueryChange: (query: string) => void
  placeholder: string
  ariaLabel: string
  className?: string
  /** The results area, rendered under the input once there is a query. */
  children: React.ReactNode
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx('fixed inset-0 z-50', className)}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-900/25 backdrop-blur-xs data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-black/40"
      />
      <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 lg:px-8 lg:py-[15vh]">
        <DialogPanel
          transition
          // In a standalone home-screen app the viewport starts at the
          // physical screen top, so without this the panel's phone position
          // (py-4 above) puts the input under the Dynamic Island — a blurred
          // screen with no visible field. The inset is 0 in browsers (their
          // chrome owns that zone), so this only moves the panel where it's
          // actually occluded.
          style={{ marginTop: 'env(safe-area-inset-top)' }}
          className="mx-auto transform-gpu overflow-hidden rounded-lg bg-white shadow-xl ring ring-zinc-900/10 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:max-w-xl dark:bg-zinc-900 dark:ring-white/10"
        >
          <Combobox
            onChange={(value: T | null) => {
              if (value !== null) onSelect(value)
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <SearchIcon className="size-5 shrink-0 stroke-zinc-500 dark:stroke-zinc-400" />
              <ComboboxInput
                autoFocus
                placeholder={placeholder}
                aria-label={ariaLabel}
                displayValue={() => query}
                onChange={(event) => onQueryChange(event.target.value)}
                className="flex-auto appearance-none bg-transparent text-base/6 text-zinc-900 outline-hidden placeholder:text-zinc-500 sm:text-sm/6 dark:text-white"
              />
            </div>
            {query.trim() !== '' && (
              <div className="border-t border-zinc-900/10 dark:border-white/10">
                {children}
              </div>
            )}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
