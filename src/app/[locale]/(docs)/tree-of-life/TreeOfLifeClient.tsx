'use client'

import { useState } from 'react'

import { Button } from '@/components/catalyst/button'
import { PageHeading } from '@/components/layout/PageHeading'
import { FlowToggle } from '@/components/player/FlowToggle'
import {
  TreeOfLifeSvg,
  type FlowDirection,
} from '@/components/tree/TreeOfLifeSvg'
import { Tab, Tabs } from '@/components/ui/Tabs'
import { enterPlayerFullscreen } from '@/lib/playerFullscreen'
import { toolbarButtonSize } from '@/lib/toolbarButton'
import type { TreeSvgData } from '@/lib/treeLayout'

export function TreeOfLifeClient({ tree }: { tree: TreeSvgData }) {
  const [flow, setFlow] = useState(false)
  const [direction, setDirection] = useState<FlowDirection>('descend')
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        {/* The toolbar is shrink-0, so when the Descend/Ascend tabs + Flow
            + Expand chips crowd the row on mobile the title truncates
            ("Tree of Li…") rather than the chips squishing. */}
        <PageHeading truncate>Tree of Life</PageHeading>
        <div className="flex shrink-0 items-center gap-2 text-zinc-900 dark:text-white">
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
          <Button
            href="/tree-of-life/expand"
            onClick={enterPlayerFullscreen}
            color="emerald"
            className={toolbarButtonSize}
          >
            Expand ⤢
          </Button>
        </div>
      </div>
      <div className="h-[calc(100svh-12rem)] w-full">
        <TreeOfLifeSvg tree={tree} flow={flow} flowDirection={direction} />
      </div>
    </article>
  )
}
