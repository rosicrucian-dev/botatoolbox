import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { TarotTableau } from '@/components/TarotTableau'

export const metadata: Metadata = {
  title: 'Tableau',
}

export default function Tableau() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Tableau' }]} />
      <PageHeading>Tableau</PageHeading>
      <TarotTableau link="card" rounded={false} />
    </article>
  )
}
