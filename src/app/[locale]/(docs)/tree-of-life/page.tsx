import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { treeSvgData } from '@/lib/tree-layout'
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

export default async function TreeOfLife({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const tree = treeSvgData(toLocale((await params).locale))
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Tree of Life' }]} />
      <TreeOfLifeClient tree={tree} />
    </>
  )
}
