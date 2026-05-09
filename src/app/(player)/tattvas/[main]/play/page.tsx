import { notFound } from 'next/navigation'

import { tattvaByKind, tattvas, type TattvaKind } from '@/lib/tattvas'
import { TattvaPlayer } from './tattva-player'

export function generateStaticParams() {
  return tattvas.map((t) => ({ main: t.kind }))
}

export default async function TattvaPlayPage({
  params,
}: {
  params: Promise<{ main: string }>
}) {
  const { main } = await params
  if (!tattvaByKind[main as TattvaKind]) notFound()
  return <TattvaPlayer main={main as TattvaKind} />
}
