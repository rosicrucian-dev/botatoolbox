import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Meditations',
}

// The group is gated: 'secret' — meditations/layout.tsx redirects to
// /settings if secret mode isn't unlocked, so this page only renders its
// cards once the group is visible.
export default function MeditationsIndex() {
  return <GroupPage title="Meditations" />
}
