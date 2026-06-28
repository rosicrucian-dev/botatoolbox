import { type Metadata } from 'next'
import { Suspense } from 'react'

import { FreeformClient } from './FreeformClient'

export const metadata: Metadata = {
  title: 'Freeform',
}

// useSearchParams (inside FreeformClient for ?cards= URL state) needs a
// Suspense boundary above it during static export.
export default function FreeformPage() {
  return (
    <Suspense>
      <FreeformClient />
    </Suspense>
  )
}
