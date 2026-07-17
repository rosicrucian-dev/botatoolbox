'use client'

import { usePathname } from 'next/navigation'

import { useLocale } from '@/components/LocaleProvider'
import { useLocalePref } from '@/lib/locale'
import {
  LOCALE_LABELS,
  localeHref,
  RELEASED_LOCALES,
  stripLocale,
  type Locale,
} from '@/lib/locales'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

// Header language dropdown. The button shows the current locale; the
// menu lists every language in its own tongue (that's who each entry is
// for). Picking one jumps to the same page in that locale — URLs are
// parallel across locales, so it's a pure prefix swap — and records the
// choice as the saved preference, so the home-page first-visit bounce
// respects an explicit pick forever after.

// Only released locales are offered; an unreleased locale being
// previewed by URL still shows as the button's current value.
const LANGUAGES: ReadonlyArray<{ id: Locale; label: string }> =
  RELEASED_LOCALES.map((id) => ({ id, label: LOCALE_LABELS[id] }))

function CheckIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.427-.003l-3.5-3.6a1 1 0 1 1 1.434-1.394l2.788 2.868 6.785-6.877a1 1 0 0 1 1.414-.008Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const { setLocalePref } = useLocalePref()

  function switchTo(target: Locale) {
    if (target === locale) return
    setLocalePref(target)
    // Same page, other locale — as a FULL navigation, on purpose. A
    // locale switch swaps the top-level [locale] segment, so a client
    // navigation re-renders the entire tree (and a view transition's
    // update callback times out waiting for it); loading the target
    // page's static HTML directly is faster and guarantees <html lang>,
    // metadata, and theme-color are all rebuilt. Query string carried
    // over at click time (window.location avoids a useSearchParams
    // Suspense bailout in the static export).
    const { path } = stripLocale(pathname)
    window.location.assign(localeHref(target, path) + window.location.search)
  }

  return (
    <Menu>
      <MenuButton
        className="flex h-6 items-center justify-center rounded-md px-1 text-xs font-semibold text-zinc-600 uppercase transition hover:bg-zinc-900/5 hover:text-zinc-900 data-open:bg-zinc-900/5 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white dark:data-open:bg-white/5"
        aria-label="Language"
      >
        <span className="absolute size-12 pointer-fine:hidden" />
        {locale}
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        transition
        className="z-50 mt-2 w-36 rounded-lg bg-white p-1 text-sm shadow-lg ring-1 ring-zinc-900/10 transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-800 dark:ring-white/10"
      >
        {LANGUAGES.map((lang) => (
          <MenuItem key={lang.id}>
            <button
              type="button"
              lang={lang.id}
              onClick={() => switchTo(lang.id)}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-zinc-700 data-focus:bg-zinc-900/5 dark:text-zinc-300 dark:data-focus:bg-white/5"
            >
              {lang.label}
              {lang.id === locale && (
                <CheckIcon className="h-4 w-4 text-emerald-500" />
              )}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}
