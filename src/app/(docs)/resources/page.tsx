import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Resources',
}

export default function ResourcesIndex() {
  return <GroupPage title="Resources" />
}
