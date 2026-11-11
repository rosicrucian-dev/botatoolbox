import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Library')

// The Library landing: a card per shelf (Texts, Recordings), each
// opening that shelf's own index. The items on a shelf are not cards
// here — the shelves are what grows, and the index is where they grow.
export default function LibraryIndex() {
  return <GroupPage slug="library" />
}
