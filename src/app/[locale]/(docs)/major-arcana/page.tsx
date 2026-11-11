import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { TarotTableau } from '@/components/tarot/TarotTableau'
import { getTarot } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Major Arcana')

// THE MAJOR ARCANA: the 22 Keys as the tableau, each card opening its
// own page. It was /tarot/tableau beside a /tarot/major-arcana that
// listed the same 22 as text — one of them had to be the index, and
// the tableau is the one a reader recognises a Key from. The Keys'
// correspondence TABLE is /correspondences/major-arcana.
export default async function MajorArcana({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { cards } = getTarot(toLocale((await params).locale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Major Arcana' }]} />
      <PageHeading>Major Arcana</PageHeading>
      <TarotTableau cards={cards} link="card" rounded={false} />
    </article>
  )
}
