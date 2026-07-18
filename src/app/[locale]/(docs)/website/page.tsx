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
    title: localizedTitle(locale, 'Website'),
  }
}

export default function WebsiteIndex() {
  return <GroupPage slug="website" />
}
