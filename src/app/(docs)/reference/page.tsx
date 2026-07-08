import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Reference',
}

export default function ReferenceIndex() {
  return <GroupPage title="Reference" />
}
