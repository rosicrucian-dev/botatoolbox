import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Rituals',
}

export default function RitualsIndex() {
  return <GroupPage title="Rituals" />
}
