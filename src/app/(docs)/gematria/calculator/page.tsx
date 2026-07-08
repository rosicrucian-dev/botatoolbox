import { type Metadata } from 'next'
import { Suspense } from 'react'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { GematriaClient } from './GematriaClient'

export const metadata: Metadata = {
  title: 'Calculator',
}

// useSearchParams (used inside GematriaClient for ?seq= sync) needs a
// Suspense boundary above it for the static export. Page is a server
// component just to host metadata + Suspense.
export default function GematriaPage() {
  return (
    <Suspense>
      <SetBreadcrumbs
        items={[
          { label: 'Calculator' },
        ]}
      />
      <GematriaClient />
    </Suspense>
  )
}
