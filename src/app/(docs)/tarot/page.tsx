import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Tarot',
}

export default function TarotIndex() {
  return <GroupPage title="Tarot" />
}
