'use client'

import { useState } from 'react'
import Link from 'next/link'

import { FlowToggle } from '@/components/FlowToggle'
import { Tab, Tabs } from '@/components/Tabs'
import {
  TreeOfLifeSvg,
  type FlowDirection,
} from '@/components/TreeOfLifeSvg'

export function TreeOfLifeClient() {
  const [flow, setFlow] = useState(false)
  const [direction, setDirection] = useState<FlowDirection>('descend')
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Tree of Life
        </h1>
        <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
          {flow && (
            <Tabs>
              <Tab
                active={direction === 'descend'}
                onClick={() => setDirection('descend')}
              >
                Descend
              </Tab>
              <Tab
                active={direction === 'ascend'}
                onClick={() => setDirection('ascend')}
              >
                Ascend
              </Tab>
            </Tabs>
          )}
          <FlowToggle pressed={flow} onPressedChange={setFlow} />
          <Link
            href="/tree-of-life/expand"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-emerald-500 px-3 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400"
          >
            Expand ⤢
          </Link>
        </div>
      </div>
      <div className="h-[calc(100svh-12rem)] w-full">
        <TreeOfLifeSvg flow={flow} flowDirection={direction} />
      </div>
    </article>
  )
}
