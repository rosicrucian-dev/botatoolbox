import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Texts',
}

export default function TextsIndex() {
  return <GroupPage title="Texts" />
}
