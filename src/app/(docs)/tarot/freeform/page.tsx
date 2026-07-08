import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { FreeformClient } from '@/components/FreeformClient'

export const metadata: Metadata = {
  title: 'Freeform',
}

export default function FreeformPage() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Freeform' }]} />
      <FreeformClient />
    </>
  )
}
