import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Reference')

// The Reference group's landing: a card per row — the Correspondences
// (the tables' own index), the Major Arcana, the Cube of Space, the
// Tree of Life. What is LOOKED UP, where the Library is what is read.
export default function ReferenceIndex() {
  return <GroupPage slug="reference" />
}
