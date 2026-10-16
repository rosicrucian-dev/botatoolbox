import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Meditations')

// Public landing page. Local development adds private meditation links
// when their ignored source files are available.
export default function MeditationsIndex() {
  return <GroupPage slug="meditations" />
}
