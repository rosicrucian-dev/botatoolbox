import { type Metadata } from 'next'

import { FreeformClient } from '@/components/FreeformClient'

export const metadata: Metadata = {
  title: 'Freeform',
}

export default function FreeformPage() {
  return <FreeformClient />
}
