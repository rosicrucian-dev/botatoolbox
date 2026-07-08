import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Healing',
}

export default function HealingIndex() {
  return <GroupPage title="Healing" />
}
