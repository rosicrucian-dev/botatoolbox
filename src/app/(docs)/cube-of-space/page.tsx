import { type Metadata } from 'next'

import { CubeOfSpaceClient } from './CubeOfSpaceClient'

export const metadata: Metadata = {
  title: 'Cube of Space',
}

export default function CubeOfSpace() {
  return <CubeOfSpaceClient />
}
