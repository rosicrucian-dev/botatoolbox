import Link from 'next/link'
import { type Metadata } from 'next'

import { TreeOfLifeSvg } from '@/components/TreeOfLifeSvg'

export const metadata: Metadata = {
  title: 'Tree of Life',
}

export default function TreeOfLife() {
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Tree of Life
        </h1>
        <Link
          href="/tree-of-life/expand"
          className="shrink-0 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400"
        >
          Expand ⤢
        </Link>
      </div>
      <div className="h-[calc(100svh-12rem)] w-full">
        <TreeOfLifeSvg />
      </div>
    </article>
  )
}
