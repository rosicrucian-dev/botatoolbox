import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { treeSvgData } from '@/lib/treeLayout'
import { TreeOfLifeClient } from './TreeOfLifeClient'

export const generateMetadata = localizedMetadata('Tree of Life')

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
