import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { CubeOfSpaceClient } from './CubeOfSpaceClient'

export const metadata: Metadata = {
  title: 'Cube of Space',
}

export default function CubeOfSpace() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Cube of Space' }]} />
      <CubeOfSpaceClient />
    </>
  )
}
