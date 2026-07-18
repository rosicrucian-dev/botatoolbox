import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { TarotTableau } from '@/components/TarotTableau'
import { getTarot } from '@/content/data'
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
