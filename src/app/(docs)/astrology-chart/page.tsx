import { type Metadata } from 'next'

import { AstrologyChartClient } from './AstrologyChartClient'

export const metadata: Metadata = {
  title: 'Astrology Chart',
}

export default function AstrologyChart() {
  return <AstrologyChartClient />
}
