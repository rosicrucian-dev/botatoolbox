import { toLocale } from '@/lib/locales'
import { treeSvgData } from '@/lib/tree-layout'
import { TreeOfLifeExpandClient } from './TreeOfLifeExpandClient'

// Server shell: builds the localized tree slice at build time and hands
// it to the client player, so the datasets stay out of the bundle.
export default async function TreeOfLifeExpandPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const tree = treeSvgData(toLocale((await params).locale))
  return <TreeOfLifeExpandClient tree={tree} />
}
