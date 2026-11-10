import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Tools')

// The Tools group landing: a card per tool (Astrology, Gematria), each
// opening that tool's first view. The views behind a tool are tabs of
// its own page and are not cards here — the group lists tools, and a
// tool is one thing.
export default function ToolsIndex() {
  return <GroupPage slug="tools" />
}
