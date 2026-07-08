import clsx from 'clsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'next-view-transitions'
import NextLink from 'next/link'
import { forwardRef } from 'react'

import { BreadcrumbTrail, useBreadcrumbs } from '@/components/Breadcrumbs'
import { Logo } from '@/components/Logo'
import {
  MobileNavigation,
  useIsInsideMobileNavigation,
  useMobileNavigationStore,
} from '@/components/MobileNavigation'
import { MobileSearch } from '@/components/Search'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CloseButton } from '@headlessui/react'

export const Header = forwardRef<
  React.ComponentRef<'div'>,
  React.ComponentPropsWithoutRef<typeof motion.div>
>(function Header({ className, ...props }, ref) {
  let { isOpen: mobileNavIsOpen } = useMobileNavigationStore()
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let crumbs = useBreadcrumbs()

  let { scrollY } = useScroll()
  let bgOpacityLight = useTransform(scrollY, [0, 72], ['50%', '90%'])
  let bgOpacityDark = useTransform(scrollY, [0, 72], ['20%', '80%'])

  return (
    <motion.div
      {...props}
      ref={ref}
      className={clsx(
        className,
        'fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-4 transition sm:px-6 lg:left-72 lg:z-30 lg:px-8 xl:left-80',
        !isInsideMobileNavigation &&
          'backdrop-blur-xs lg:left-72 xl:left-80 dark:backdrop-blur-sm',
        isInsideMobileNavigation
          ? 'bg-white dark:bg-zinc-900'
          : 'bg-white/(--bg-opacity-light) dark:bg-zinc-900/(--bg-opacity-dark)',
      )}
      style={
        {
          '--bg-opacity-light': bgOpacityLight,
          '--bg-opacity-dark': bgOpacityDark,
          // In an iOS standalone PWA the status-bar style is black-translucent,
          // so content extends under the dynamic island. Grow the bar by the
          // top safe-area inset and pad its content below the island. This is
          // 0 in a normal browser, so it only affects "Open as web app".
          height: 'calc(3.5rem + env(safe-area-inset-top))',
          paddingTop: 'env(safe-area-inset-top)',
        } as React.CSSProperties
      }
    >
      <div
        className={clsx(
          'absolute inset-x-0 top-full h-px transition',
          (isInsideMobileNavigation || !mobileNavIsOpen) &&
            'bg-zinc-900/7.5 dark:bg-white/7.5',
        )}
      />
      {/* Left: the mobile nav FAB (fixed-position; kept mounted here) plus
          the page's breadcrumb trail. When a page declares no trail, fall
          back to the mobile logo — breadcrumbs are never forced. */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="lg:hidden">
          <MobileNavigation />
        </div>
        {/* Both states (breadcrumb trail / logo fallback) share one fixed
            h-6 centered box, so toggling between home and a detail page
            never shifts them vertically relative to the hamburger. */}
        <div className="flex h-6 min-w-0 flex-1 items-center">
          {crumbs.length > 0 ? (
            <BreadcrumbTrail items={crumbs} />
          ) : (
            /* Plain link inside the open drawer — same reasoning as NavLink
               in Navigation.tsx: don't stack a view transition on top of the
               drawer's own close animation. */
            <CloseButton
              as={isInsideMobileNavigation ? NextLink : Link}
              href="/"
              aria-label="Home"
              className="lg:hidden"
            >
              <Logo />
            </CloseButton>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <MobileSearch />
        <ThemeToggle />
      </div>
    </motion.div>
  )
})
