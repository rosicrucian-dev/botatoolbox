import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { getAstrology } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { ChartClient } from './ChartClient'

export const generateMetadata = localizedMetadata('Astrology Chart')

export default async function AstrologyChart({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { planetBySlug, signBySlug } = getAstrology(
    toLocale((await params).locale),
  )
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Chart' }]} />
      <ChartClient planetBySlug={planetBySlug} signBySlug={signBySlug} />
    </>
  )
}
