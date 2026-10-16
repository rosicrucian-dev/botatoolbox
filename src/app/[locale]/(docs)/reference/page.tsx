import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Reference')

export default function ReferenceIndex() {
  return <GroupPage slug="reference" />
}
