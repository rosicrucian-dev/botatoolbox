import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Astrology')

// The Astrology group landing (Chart, plus any unlisted tools). This used to
// be a redirect stub to /reference/astrology for old "signs & planets"
// bookmarks; that content now lives at /reference/astrology (linked from the
// Reference group), so /astrology belongs to the Astrology tools group.
export default function AstrologyIndex() {
  return <GroupPage slug="astrology" />
}
