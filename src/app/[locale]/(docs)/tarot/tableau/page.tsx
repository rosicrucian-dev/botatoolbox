import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { TarotTableau } from '@/components/tarot/TarotTableau'
import { getTarot } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Tableau')

export default async function Tableau({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { cards } = getTarot(toLocale((await params).locale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Tableau' }]} />
      <PageHeading>Tableau</PageHeading>
      <TarotTableau cards={cards} link="card" rounded={false} />
    </article>
  )
}
