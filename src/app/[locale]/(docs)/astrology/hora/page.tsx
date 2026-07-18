import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { getAstrology } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { HoraClient } from './HoraClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Hora'),
    description:
      'Planetary hours computed live for your location — the ruling planet of the current hour, and the hours ahead.',
  }
}

export default async function Hora({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { planetBySlug } = getAstrology(toLocale((await params).locale))
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Hora' }]} />
      <HoraClient planetBySlug={planetBySlug} />
    </>
  )
}
