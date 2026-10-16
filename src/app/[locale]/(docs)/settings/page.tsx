import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { localizedMetadata } from '@/lib/nav'
import { SettingsClient } from './SettingsClient'

export const generateMetadata = localizedMetadata('Settings')

export default function Settings() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Settings' }]} />
      <PageHeading>Settings</PageHeading>
      <SettingsClient />
    </article>
  )
}
