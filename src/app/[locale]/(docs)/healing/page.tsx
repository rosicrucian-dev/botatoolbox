import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Healing')

export default function HealingIndex() {
  return <GroupPage slug="healing" />
}
