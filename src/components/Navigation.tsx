'use client'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

import { Link, PlainLink } from '@/components/LocaleLink'
import { useLocale } from '@/components/LocaleProvider'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { stripLocale } from '@/lib/locales'
import { getVisibleNavigation, type NavGroup } from '@/lib/nav'
import { remToPx } from '@/lib/remToPx'
import { useSecretMode } from '@/lib/useSecretMode'
import { CloseButton } from '@headlessui/react'

function useInitialValue<T>(value: T, condition = true) {
  // eslint-disable-next-line react-hooks/refs
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

// `trailingSlash: true` in next.config.mjs makes usePathname() return paths
// with a trailing slash ("/healing/planets/"), but our nav hrefs don't have
// one — and under /de/ the pathname carries a locale prefix the (English)
// nav hrefs never do. Normalize both away before comparing.
function normalizePath(p: string) {
  const path = stripLocale(p).path
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) {
  // Inside the mobile drawer, navigate WITHOUT a view transition. The
  // drawer plays its own slide-out animation as it closes; layering the
  // cross-fade on top means the transition's "old" snapshot still shows
  // the open drawer — two competing animations back to back (visible
  // jank on iPhone). The drawer close is feedback enough there; the
  // always-visible desktop sidebar keeps the cross-fade.
  const insideMobileNav = useIsInsideMobileNavigation()
  return (
    <CloseButton
      as={insideMobileNav ? PlainLink : Link}
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 pl-4 text-sm transition',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
      )}
    >
      <span className="truncate">{children}</span>
    </CloseButton>
  )
}

// Soft background box behind the active page link.
function ActivePageHighlight({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let itemHeight = remToPx(2)
  let normalizedPath = normalizePath(pathname)
  let top =
    group.links.findIndex((link) => link.href === normalizedPath) * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height: itemHeight, top }}
    />
  )
}

function ActivePageMarker({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let normalizedPath = normalizePath(pathname)
  let activePageIndex = group.links.findIndex(
    (link) => link.href === normalizedPath,
  )
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-emerald-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({
  group,
  className,
}: {
  group: NavGroup
  className?: string
}) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let pathname = useInitialValue(usePathname(), isInsideMobileNavigation)

  let normalizedPath = normalizePath(pathname)
  let isActiveGroup =
    group.links.findIndex((link) => link.href === normalizedPath) !== -1

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <ActivePageHighlight group={group} pathname={pathname} />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === normalizedPath}>
                {link.title}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export function Navigation(props: React.ComponentPropsWithoutRef<'nav'>) {
  const { unlocked } = useSecretMode()
  const locale = useLocale()
  const visible = getVisibleNavigation(locale).filter(
    (group) => group.gated !== 'secret' || unlocked,
  )
  return (
    <nav {...props}>
      <ul role="list">
        {visible.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? 'md:mt-0' : ''}
          />
        ))}
      </ul>
    </nav>
  )
}
