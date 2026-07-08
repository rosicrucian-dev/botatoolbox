import { type Metadata } from 'next'
import { Suspense } from 'react'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { NumberDictionaryClient } from './NumberDictionaryClient'

export const metadata: Metadata = {
  title: 'Dictionary',
}

// useSearchParams (used inside the client for ?n= sync) needs a Suspense
// boundary above it for the static export. Page is a server component just
// to host metadata + Suspense.
export default function GematriaWordsPage() {
  return (
    <Suspense>
      <SetBreadcrumbs
        items={[
          { label: 'Dictionary' },
        ]}
      />
      <NumberDictionaryClient />
    </Suspense>
  )
}
