import { type Metadata } from 'next'
import { Suspense } from 'react'

import { RandomPullClient } from './RandomPullClient'

export const metadata: Metadata = {
  title: 'Random Pull',
}

// useSearchParams (inside RandomPullClient for ?pulled= URL state) needs
// a Suspense boundary above it during static export.
export default function RandomPullPage() {
  return (
    <Suspense>
      <RandomPullClient />
    </Suspense>
  )
}
