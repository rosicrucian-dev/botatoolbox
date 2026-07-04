import { type Metadata } from 'next'

import { PageHeading } from '@/components/PageHeading'
import { SettingsClient } from './SettingsClient'

export const metadata: Metadata = {
  title: 'Settings',
}

export default function Settings() {
  return (
    <article className="space-y-6">
      <PageHeading>Settings</PageHeading>
      <SettingsClient />
    </article>
  )
}
