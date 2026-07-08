import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Utilities',
}

export default function UtilitiesIndex() {
  return <GroupPage title="Utilities" />
}
