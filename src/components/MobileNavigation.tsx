'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react'
import { motion } from 'framer-motion'
import { Suspense, createContext, useContext } from 'react'
import { create } from 'zustand'

import { Header } from '@/components/Header'
import { Navigation } from '@/components/Navigation'

function MenuIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 10 9"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M.5 1h9M.5 8h9M.5 4.5h9" />
    </svg>
  )
}

function XIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 10 9"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m1.5 1 7 7M8.5 1l-7 7" />
    </svg>
  )
}

const IsInsideMobileNavigationContext = createContext(false)

function MobileNavigationDialog({
  isOpen,
  close,
}: {
  isOpen: boolean
  close: () => void
}) {
  return (
    <Dialog
      transition
      open={isOpen}
      onClose={close}
      className="fixed inset-0 z-50 lg:hidden"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 top-14 bg-zinc-400/20 backdrop-blur-xs data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-black/40"
      />

      <DialogPanel>
        <TransitionChild>
          <Header className="data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
        </TransitionChild>

        <TransitionChild>
          <motion.div
            layoutScroll
            // Starts below the header, which is taller in a standalone PWA by
            // the top safe-area inset (0 in a normal browser). Matches Header.tsx.
            style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}
            className="fixed bottom-0 left-0 w-full overflow-y-auto bg-white px-4 pt-6 pb-4 shadow-lg ring-1 shadow-zinc-900/10 ring-zinc-900/7.5 duration-500 ease-in-out data-closed:-translate-x-full min-[416px]:max-w-sm sm:px-6 sm:pb-10 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <Navigation />
          </motion.div>
        </TransitionChild>
      </DialogPanel>
    </Dialog>
  )
}

export function useIsInsideMobileNavigation() {
  return useContext(IsInsideMobileNavigationContext)
}

export const useMobileNavigationStore = create<{
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

export function MobileNavigation() {
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let { isOpen, toggle, close } = useMobileNavigationStore()
  let ToggleIcon = isOpen ? XIcon : MenuIcon

  return (
    <IsInsideMobileNavigationContext.Provider value={true}>
      <button
        type="button"
        // Floating, thumb-reachable nav toggle pinned to the bottom-right,
        // above the iOS home indicator via the safe-area inset. It renders both
        // at page level (to open) and again inside the open dialog (to close) —
        // the in-dialog copy stacks above the slide-over panel, so one control
        // both opens and closes the nav. ~56px (size-14) is Apple's comfortable
        // touch-target size; the translucent blur + hairline ring match the
        // iOS "Liquid Glass" floating-control look.
        className="fixed right-[calc(env(safe-area-inset-right)+1.25rem)] bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] z-50 flex size-14 items-center justify-center rounded-full bg-white/75 text-zinc-900 shadow-lg shadow-zinc-900/20 ring-1 ring-zinc-900/10 backdrop-blur-md transition active:scale-95 dark:bg-zinc-800/75 dark:text-white dark:shadow-black/40 dark:ring-white/10"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <ToggleIcon className="w-4 stroke-current" />
      </button>
      {!isInsideMobileNavigation && (
        <Suspense fallback={null}>
          <MobileNavigationDialog isOpen={isOpen} close={close} />
        </Suspense>
      )}
    </IsInsideMobileNavigationContext.Provider>
  )
}
