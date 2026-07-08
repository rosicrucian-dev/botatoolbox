import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { CardGrid } from '@/components/NavCards'
import { PageHeading } from '@/components/PageHeading'
import { visibleNavigation } from '@/lib/nav'

// A landing page for a sidebar group (Astrology, Reference, Devices, …).
// Renders the group's title and the same hover-reveal card grid the home
// page uses, but scoped to that one group. Uses visibleNavigation so
// `hidden` (unlisted) links are dropped, matching the home TOC.
//
// The breadcrumb here is just the group leaf — BreadcrumbTrail prepends
// "BOTA" and knows this page IS the group page, so it renders "BOTA /
// <Group>" without linking the group crumb back to itself.
export function GroupPage({ title }: { title: string }) {
  const group = visibleNavigation.find((g) => g.title === title)
  const links = group?.links ?? []
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: title }]} />
      <PageHeading>{title}</PageHeading>
      <CardGrid links={links} />
    </article>
  )
}
