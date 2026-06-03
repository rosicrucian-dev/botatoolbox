import { type Metadata } from 'next'

import { MembersOnlyClient } from './MembersOnlyClient'

export const metadata: Metadata = {
  title: 'Members Only',
}

export default function MembersOnlyPage() {
  return <MembersOnlyClient />
}
