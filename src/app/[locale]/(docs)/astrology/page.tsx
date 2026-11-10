import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { getAstrology } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { ChartClient } from './ChartClient'

export const generateMetadata = localizedMetadata('Astrology')

// THE ASTROLOGY TOOL, and its first view: the chart (src/lib/tools.ts).
// It was /astrology/chart under an Astrology nav group whose landing
// page listed two cards; the group is one row of Tools now, and the row
// lands here — on the thing almost everyone came for — with Hora a tab
// away. /astrology/chart redirects here.
export default async function Astrology({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { planetBySlug, signBySlug } = getAstrology(
    toLocale((await params).locale),
  )
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Astrology' }]} />
      <ChartClient planetBySlug={planetBySlug} signBySlug={signBySlug} />
    </>
  )
}
