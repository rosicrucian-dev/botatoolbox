import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Website', '/website')

export default function WebsiteIndex() {
  return <GroupPage slug="website" />
}
