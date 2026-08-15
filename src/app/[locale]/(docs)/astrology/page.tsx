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
    title: localizedTitle(locale, 'Astrology'),
  }
}

// The Astrology group landing (Chart, plus any unlisted tools). This used to
// be a redirect stub to /reference/astrology for old "signs & planets"
// bookmarks; that content now lives at /reference/astrology (linked from the
// Reference group), so /astrology belongs to the Astrology tools group.
export default function AstrologyIndex() {
  return <GroupPage slug="astrology" />
}
