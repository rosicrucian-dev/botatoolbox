import { Suspense } from 'react'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { NumberDictionaryClient } from './NumberDictionaryClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Dictionary'),
  }
}

// useSearchParams (used inside the client for ?n= sync) needs a Suspense
// boundary above it for the static export. Page is a server component just
// to host metadata + Suspense.
export default function GematriaWordsPage() {
  return (
    <Suspense>
      <SetBreadcrumbs items={[{ label: 'Dictionary' }]} />
      <NumberDictionaryClient />
    </Suspense>
  )
}
