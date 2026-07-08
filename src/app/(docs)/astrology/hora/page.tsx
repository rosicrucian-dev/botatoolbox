import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { HoraClient } from './HoraClient'

export const metadata: Metadata = {
  title: 'Hora',
  description:
    'Planetary hours computed live for your location — the ruling planet of the current hour, and the hours ahead.',
}

export default function Hora() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Hora' }]} />
      <HoraClient />
    </>
  )
}
