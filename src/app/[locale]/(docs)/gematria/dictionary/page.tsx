import { Suspense } from 'react'

import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { localizedMetadata } from '@/lib/nav'
import { NumberDictionaryClient } from './NumberDictionaryClient'

export const generateMetadata = localizedMetadata('Dictionary')

// useSearchParams (used inside the client for ?n= sync) needs a Suspense
// boundary above it for the static export. Page is a server component just
// to host metadata + Suspense.
export default function GematriaWordsPage() {
  return (
    <Suspense>
      <SetBreadcrumbs items={[{ label: 'Dictionary' }]} />
      <NumberDictionaryClient />
    </Suspense>
  )
}
