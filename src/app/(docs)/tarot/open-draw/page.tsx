import { type Metadata } from 'next'
import { Suspense } from 'react'

import { OpenDrawClient } from './OpenDrawClient'

export const metadata: Metadata = {
  title: 'Open Draw',
}

// useSearchParams (inside OpenDrawClient for ?cards= URL state) needs a
// Suspense boundary above it during static export.
export default function OpenDrawPage() {
  return (
    <Suspense>
      <OpenDrawClient />
    </Suspense>
  )
}
