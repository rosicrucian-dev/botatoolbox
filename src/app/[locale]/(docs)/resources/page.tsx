import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Resources')

export default function ResourcesIndex() {
  return <GroupPage slug="resources" />
}
