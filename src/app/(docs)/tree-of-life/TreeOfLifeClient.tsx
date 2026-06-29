'use client'

import { useState } from 'react'

import { Button } from '@/components/catalyst/button'
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
        {/* On mobile, hide the title when Flow is on so the
            Descend/Ascend tabs + Flow + Expand chips have room to fit
            without squishing. Desktop has the space — always show. */}
        <h1
          className={`text-3xl font-semibold tracking-tight dark:text-white ${flow ? 'hidden md:block' : ''}`}
        >
          Tree of Life
        </h1>
        {/* ml-auto keeps the chips right-aligned even when the h1
            collapses out on mobile under Flow=on. */}
        <div className="ml-auto flex items-center gap-2 text-zinc-900 dark:text-white">
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
          <Button href="/tree-of-life/expand" color="emerald">
            Expand ⤢
          </Button>
        </div>
      </div>
      <div className="h-[calc(100svh-12rem)] w-full">
        <TreeOfLifeSvg flow={flow} flowDirection={direction} />
      </div>
    </article>
  )
}
