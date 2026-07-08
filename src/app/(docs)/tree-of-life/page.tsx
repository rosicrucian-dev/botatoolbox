import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { TreeOfLifeClient } from './TreeOfLifeClient'

export const metadata: Metadata = {
  title: 'Tree of Life',
}

export default function TreeOfLife() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Tree of Life' }]} />
      <TreeOfLifeClient />
    </>
  )
}
