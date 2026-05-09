import { type Metadata } from 'next'
import { Suspense } from 'react'

import { GematriaClient } from './GematriaClient'

export const metadata: Metadata = {
  title: 'Gematria',
}

// useSearchParams (used inside GematriaClient for ?seq= sync) needs a
// Suspense boundary above it for the static export. Page is a server
// component just to host metadata + Suspense.
export default function GematriaPage() {
  return (
    <Suspense>
      <GematriaClient />
    </Suspense>
  )
}
