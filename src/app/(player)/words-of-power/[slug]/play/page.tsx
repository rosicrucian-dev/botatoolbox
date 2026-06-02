import { notFound } from 'next/navigation'

import { words } from '@/content/data'
import { WordOfPowerPlayer } from './word-player'

export function generateStaticParams() {
  return words.map((w) => ({ slug: w.slug }))
}

export default async function WordOfPowerPlayPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const raw = words.find((w) => w.slug === slug)
  if (!raw) notFound()

  return <WordOfPowerPlayer raw={raw} />
}
