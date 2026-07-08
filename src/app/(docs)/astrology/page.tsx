import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'

export const metadata: Metadata = {
  title: 'Astrology',
}

// The Astrology group landing (Chart, plus any unlisted tools). This used to
// be a redirect stub to /reference/astrology for old "signs & planets"
// bookmarks; that content now lives at /reference/astrology (linked from the
// Reference group), so /astrology belongs to the Astrology tools group.
export default function AstrologyIndex() {
  return <GroupPage title="Astrology" />
}
