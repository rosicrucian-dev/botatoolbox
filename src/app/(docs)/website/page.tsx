import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Website',
}

export default function WebsiteIndex() {
  return <GroupPage title="Website" />
}
