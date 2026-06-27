import { type Metadata } from 'next'
import { Suspense } from 'react'

import { TableDrawClient } from './TableDrawClient'

export const metadata: Metadata = {
  title: 'Table Draw',
}

// useSearchParams (inside TableDrawClient for ?cards= URL state) needs a
// Suspense boundary above it during static export.
export default function TableDrawPage() {
  return (
    <Suspense>
      <TableDrawClient />
    </Suspense>
  )
}
