import { type Metadata } from 'next'

import { SettingsClient } from './SettingsClient'

export const metadata: Metadata = {
  title: 'Settings',
}

export default function Settings() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Settings
      </h1>
      <SettingsClient />
    </article>
  )
}
