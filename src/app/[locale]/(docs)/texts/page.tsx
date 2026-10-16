import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Texts')

export default function TextsIndex() {
  return <GroupPage slug="texts" />
}
