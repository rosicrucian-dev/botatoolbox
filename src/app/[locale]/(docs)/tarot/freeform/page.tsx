import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { FreeformClient } from '@/components/FreeformClient'
import { freeformDeck } from '@/lib/freeformDeck'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Freeform'),
  }
}

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
