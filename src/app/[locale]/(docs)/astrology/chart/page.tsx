import { SetBreadcrumbs } from '@/components/Breadcrumbs'

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

export default function AstrologyChart() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Chart' }]} />
      <ChartClient />
    </>
  )
}
