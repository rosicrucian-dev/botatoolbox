import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { Prose } from '@/components/ui/Prose'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Community')

export default function Community() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Community' }]} />
      <PageHeading>Community</PageHeading>
      <Prose>
        <p>
          Join the forum at <a href="https://pfclist.org">pfclist.org</a> to
          discuss BOTA-related topics.
        </p>
      </Prose>
    </article>
  )
}
