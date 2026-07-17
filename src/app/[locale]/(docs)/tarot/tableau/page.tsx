import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { TarotTableau } from '@/components/TarotTableau'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Tableau'),
  }
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
