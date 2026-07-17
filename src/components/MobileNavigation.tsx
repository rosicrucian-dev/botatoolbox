'use client'

import { useT } from '@/content/messages/useT'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react'
import { motion } from 'framer-motion'
import { Suspense, createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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

// Floating, thumb-reachable nav toggle pinned to the bottom-right, above the
// iOS home indicator via the safe-area inset. ~56px (size-14) is Apple's
// comfortable touch-target size; the translucent blur + hairline ring match the
// iOS "Liquid Glass" floating-control look.
const NAV_FAB_CLASS =
  'fixed right-[calc(env(safe-area-inset-right)+1.25rem)] bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] z-[60] flex size-14 items-center justify-center rounded-full bg-white/75 text-zinc-900 shadow-lg shadow-zinc-900/20 ring-1 ring-zinc-900/10 backdrop-blur-md transition active:scale-95 lg:hidden dark:bg-zinc-800/75 dark:text-white dark:shadow-black/40 dark:ring-white/10'

function NavFab({ open, onClick }: { open: boolean; onClick: () => void }) {
  const { t } = useT()
  const Icon = open ? XIcon : MenuIcon
  return (
    <button
      type="button"
      className={NAV_FAB_CLASS}
      aria-label={t('mobileNav.toggle')}
      aria-expanded={open}
      onClick={onClick}
    >
      <Icon className="w-4 stroke-current" />
    </button>
  )
}

// The closed-state floating trigger. Portaled to <body> so `position: fixed`
// resolves against the viewport — rendered inside the page Header it would be
// trapped by that bar's backdrop-filter containing block and land at the
// top-right of the header instead of the bottom-right of the screen. While the
// nav is open the in-dialog FAB (inside DialogPanel) takes over, so this one
// unmounts to avoid the modal's inert layer swallowing its clicks.
function PortalNavFab() {
  const { isOpen, open } = useMobileNavigationStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || isOpen) return null
  return createPortal(<NavFab open={false} onClick={open} />, document.body)
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

        {/* The open-state floating toggle. Lives inside the panel so it sits
            above the slide-over (z) and stays interactive under the modal's
            inert layer — tap to close. */}
        <NavFab open={isOpen} onClick={close} />
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
  const { t } = useT()
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let { isOpen, toggle, close } = useMobileNavigationStore()
  let ToggleIcon = isOpen ? XIcon : MenuIcon

  return (
    <IsInsideMobileNavigationContext.Provider value={true}>
      {/* Top-left header toggle — always present as the reliable backup. */}
      <button
        type="button"
        className="relative flex size-6 items-center justify-center rounded-md transition hover:bg-zinc-900/5 dark:hover:bg-white/5"
        aria-label={t('mobileNav.toggle')}
        onClick={toggle}
      >
        <span className="absolute size-12 pointer-fine:hidden" />
        <ToggleIcon className="w-2.5 stroke-zinc-900 dark:stroke-white" />
      </button>
      {!isInsideMobileNavigation && (
        <>
          <PortalNavFab />
          <Suspense fallback={null}>
            <MobileNavigationDialog isOpen={isOpen} close={close} />
          </Suspense>
        </>
      )}
    </IsInsideMobileNavigationContext.Provider>
  )
}
