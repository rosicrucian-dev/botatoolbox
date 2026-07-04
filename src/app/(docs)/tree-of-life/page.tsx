import { type Metadata } from 'next'

import { TreeOfLifeClient } from './TreeOfLifeClient'

export const metadata: Metadata = {
  title: 'Tree of Life',
}

export default function TreeOfLife() {
  return <TreeOfLifeClient />
}
