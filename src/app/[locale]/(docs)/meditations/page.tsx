import { GroupPage } from '@/components/GroupPage'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Meditations'),
  }
}

// The group is gated: 'secret' — meditations/layout.tsx redirects to
// /settings if secret mode isn't unlocked, so this page only renders its
// cards once the group is visible.
export default function MeditationsIndex() {
  return <GroupPage title="Meditations" />
}
