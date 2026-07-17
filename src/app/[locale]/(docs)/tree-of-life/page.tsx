import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { TreeOfLifeClient } from './TreeOfLifeClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Tree of Life'),
  }
}

export default function TreeOfLife() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Tree of Life' }]} />
      <TreeOfLifeClient />
    </>
  )
}
