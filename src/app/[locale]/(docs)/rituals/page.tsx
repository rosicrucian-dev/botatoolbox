import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Rituals')

export default function RitualsIndex() {
  return <GroupPage slug="rituals" />
}
