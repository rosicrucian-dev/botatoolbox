import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Practice')

export default function PracticeIndex() {
  return <GroupPage slug="practice" />
}
