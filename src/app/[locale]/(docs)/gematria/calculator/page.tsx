import { Suspense } from 'react'

import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { cardByGlyph } from '@/lib/glyphCards'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { GematriaClient } from './GematriaClient'

export const generateMetadata = localizedMetadata('Calculator')

// useSearchParams (used inside GematriaClient for ?seq= sync) needs a
// Suspense boundary above it for the static export. Page is a server
// component just to host metadata + Suspense.
export default async function GematriaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return (
    <Suspense>
      <SetBreadcrumbs items={[{ label: 'Calculator' }]} />
      <GematriaClient cardByGlyph={cardByGlyph(locale)} />
    </Suspense>
  )
}
