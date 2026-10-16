import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Devices')

export default function DevicesIndex() {
  return <GroupPage slug="devices" />
}
