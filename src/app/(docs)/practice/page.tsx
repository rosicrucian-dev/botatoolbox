import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Practice',
}

export default function PracticeIndex() {
  return <GroupPage title="Practice" />
}
