import { type Metadata } from 'next'

import { ChartClient } from './ChartClient'

export const metadata: Metadata = {
  title: 'Astrology Chart',
}

export default function AstrologyChart() {
  return <ChartClient />
}
