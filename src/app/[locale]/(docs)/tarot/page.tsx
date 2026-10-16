import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Tarot')

export default function TarotIndex() {
  return <GroupPage slug="tarot" />
}
