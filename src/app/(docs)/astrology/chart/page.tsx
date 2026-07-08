import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { ChartClient } from './ChartClient'

export const metadata: Metadata = {
  title: 'Astrology Chart',
}

export default function AstrologyChart() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Chart' }]} />
      <ChartClient />
    </>
  )
}
