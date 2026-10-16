import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { FreeformClient } from '@/components/tarot/FreeformClient'
import { freeformDeck } from '@/lib/freeformDeck'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Freeform')

export default async function FreeformPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const deck = freeformDeck(toLocale((await params).locale))
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Freeform' }]} />
      <FreeformClient deck={deck} />
    </>
  )
}
