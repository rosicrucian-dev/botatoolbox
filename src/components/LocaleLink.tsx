'use client'

import {
  Link as TransitionLink,
  useTransitionRouter,
} from 'next-view-transitions'
import NextLink, { type LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { forwardRef, useMemo } from 'react'

import { useLocale } from '@/components/LocaleProvider'
import { localeHref, type Locale } from '@/lib/locales'

// Locale-aware Link wrappers. All internal navigation goes through
// these (enforced by no-restricted-imports in eslint.config.mjs) so a
// page rendered under /de/ links within /de/ automatically, while
// English hrefs pass through byte-identical. `Link` wraps the
// next-view-transitions Link (docs-side cross-fade); `PlainLink` wraps
// plain next/link for the full-screen players, which deliberately skip
// view transitions so the iOS toolbar-priming dance is undisturbed.

// Intersecting LinkProps with the anchor props collapses href to a
// plain string — UrlObject hrefs aren't used anywhere in the app.
type AnchorProps = LinkProps & React.ComponentPropsWithoutRef<'a'>

/** For imperative navigation (router.push targets, location writes). */
export function useLocalizedHref(): (path: string) => string {
  const locale = useLocale()
  return (path) => localeHref(locale, path)
}

// Locale-aware drop-ins for useRouter/useTransitionRouter: push/replace
// prefix string hrefs for the current locale, everything else delegates.
// Query-only hrefs ('?x=1') pass through localeHref untouched.
function localizeRouter<
  R extends {
    push: (href: string, ...rest: never[]) => void
    replace: (href: string, ...rest: never[]) => void
  },
>(router: R, locale: Locale): R {
  return {
    ...router,
    push: (href: string, ...rest: never[]) =>
      router.push(localeHref(locale, href), ...rest),
    replace: (href: string, ...rest: never[]) =>
      router.replace(localeHref(locale, href), ...rest),
  }
}

export function useLocaleRouter(): ReturnType<typeof useRouter> {
  const router = useRouter()
  const locale = useLocale()
  return useMemo(() => localizeRouter(router, locale), [router, locale])
}

export function useLocaleTransitionRouter(): ReturnType<
  typeof useTransitionRouter
> {
  const router = useTransitionRouter()
  const locale = useLocale()
  return useMemo(() => localizeRouter(router, locale), [router, locale])
}

export const Link = forwardRef(function Link(
  { href, ...props }: AnchorProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const locale = useLocale()
  return <TransitionLink {...props} href={localeHref(locale, href)} ref={ref} />
})

export const PlainLink = forwardRef(function PlainLink(
  { href, ...props }: AnchorProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const locale = useLocale()
  return <NextLink {...props} href={localeHref(locale, href)} ref={ref} />
})
