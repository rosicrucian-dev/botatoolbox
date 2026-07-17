import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { CubeOfSpaceClient } from './CubeOfSpaceClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Cube of Space'),
  }
}

export default function CubeOfSpace() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Cube of Space' }]} />
      <CubeOfSpaceClient />
    </>
  )
}
