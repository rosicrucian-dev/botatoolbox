import { Suspense } from 'react'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { GematriaClient } from './GematriaClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Calculator'),
  }
}

// useSearchParams (used inside GematriaClient for ?seq= sync) needs a
// Suspense boundary above it for the static export. Page is a server
// component just to host metadata + Suspense.
export default function GematriaPage() {
  return (
    <Suspense>
      <SetBreadcrumbs items={[{ label: 'Calculator' }]} />
      <GematriaClient />
    </Suspense>
  )
}
