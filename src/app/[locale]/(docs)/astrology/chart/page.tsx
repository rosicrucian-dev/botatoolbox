import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { getAstrology } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { ChartClient } from './ChartClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Astrology Chart'),
  }
}

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
