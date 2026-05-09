'use client'

import { useState } from 'react'
import Link from 'next/link'

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
          <Link
            href="/cube-of-space/expand"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-emerald-500 px-3 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400"
          >
            Expand ⤢
          </Link>
        </div>
      </div>
      <div className="h-[calc(100svh-12rem)] w-full">
        <CubeCanvas flow={flow} />
      </div>
    </article>
  )
}
