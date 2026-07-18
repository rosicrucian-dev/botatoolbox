'use client'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { CardGrid } from '@/components/NavCards'
import { PageHeading } from '@/components/PageHeading'
import { useVisibleNav } from '@/components/NavProvider'

// A landing page for a sidebar group (Astrology, Reference, Devices, …).
// Renders the group's title and the same hover-reveal card grid the home
// page uses, but scoped to that one group. Uses the visible navigation so
// `hidden` (unlisted) links are dropped, matching the home TOC.
//
// `slug` is the group's stable id from nav-data.ts; the rendered
// heading/crumb is the translated title. Client component purely so it
// can read the locale.
//
// The breadcrumb here is just the group leaf — BreadcrumbTrail prepends
// "BOTA" and knows this page IS the group page, so it renders "BOTA /
// <Group>" without linking the group crumb back to itself.
export function GroupPage({ slug }: { slug: string }) {
  const group = useVisibleNav().find((g) => g.slug === slug)
  const links = group?.links ?? []
  const label = group?.title ?? slug
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label }]} />
      <PageHeading>{label}</PageHeading>
      <CardGrid links={links} />
    </article>
  )
}
