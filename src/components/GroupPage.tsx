'use client'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { useLocale } from '@/components/LocaleProvider'
import { CardGrid } from '@/components/NavCards'
import { PageHeading } from '@/components/PageHeading'
import { getVisibleNavigation } from '@/lib/nav'
import { navGroupSlug } from '@/lib/nav-data'

// A landing page for a sidebar group (Astrology, Reference, Devices, …).
// Renders the group's title and the same hover-reveal card grid the home
// page uses, but scoped to that one group. Uses the visible navigation so
// `hidden` (unlisted) links are dropped, matching the home TOC.
//
// `title` is the ENGLISH group title (it doubles as the stable id — the
// group is looked up by slug so the rendered heading/crumb can be the
// translated title). Client component purely so it can read the locale.
//
// The breadcrumb here is just the group leaf — BreadcrumbTrail prepends
// "BOTA" and knows this page IS the group page, so it renders "BOTA /
// <Group>" without linking the group crumb back to itself.
export function GroupPage({ title }: { title: string }) {
  const locale = useLocale()
  const slug = navGroupSlug(title)
  const group = getVisibleNavigation(locale).find((g) => g.slug === slug)
  const links = group?.links ?? []
  const label = group?.title ?? title
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label }]} />
      <PageHeading>{label}</PageHeading>
      <CardGrid links={links} />
    </article>
  )
}
