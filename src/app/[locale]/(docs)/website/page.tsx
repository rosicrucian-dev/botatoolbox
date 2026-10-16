import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Website')

export default function WebsiteIndex() {
  return <GroupPage slug="website" />
}
