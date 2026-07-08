import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Devices',
}

export default function DevicesIndex() {
  return <GroupPage title="Devices" />
}
