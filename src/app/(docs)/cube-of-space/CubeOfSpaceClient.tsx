'use client'

import { useState } from 'react'

import { Button } from '@/components/catalyst/button'
import { CubeCanvas } from '@/components/CubeCanvas'
import { FlowToggle } from '@/components/FlowToggle'

export function CubeOfSpaceClient() {
  const [flow, setFlow] = useState(false)
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Cube of Space
        </h1>
        <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
          <FlowToggle pressed={flow} onPressedChange={setFlow} />
          <Button href="/cube-of-space/expand" color="emerald">
            Expand ⤢
          </Button>
        </div>
      </div>
      <div className="h-[calc(100svh-12rem)] w-full">
        <CubeCanvas flow={flow} />
      </div>
    </article>
  )
}
