import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Utilities')

export default function UtilitiesIndex() {
  return <GroupPage slug="utilities" />
}
