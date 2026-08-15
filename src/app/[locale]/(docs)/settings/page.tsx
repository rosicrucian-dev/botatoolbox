import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { SettingsClient } from './SettingsClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Settings'),
  }
}

export default function Settings() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Settings' }]} />
      <PageHeading>Settings</PageHeading>
      <SettingsClient />
    </article>
  )
}
