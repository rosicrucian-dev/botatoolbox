'use client'

import { Suspense, useState } from 'react'

import { Button } from '@/components/catalyst/button'
import { CubeCanvas } from '@/components/CubeCanvas'
import { FlowToggle } from '@/components/FlowToggle'
import { useLocale } from '@/components/LocaleProvider'
import { PageHeading } from '@/components/PageHeading'
import { toolbarButtonSize } from '@/components/toolbarButton'
import { cubeEdges, cubeFaces, getTarot } from '@/content/data'
import { enterPlayerFullscreen } from '@/lib/playerFullscreen'

// The cube's attributions, as text, for screen readers — the WebGL canvas
// is invisible to AT and this is real content (which card sits on each
// face and edge). Zero visual footprint.
function CubeAttributionsSrOnly() {
  const { cardBySlug } = getTarot(useLocale())
  return (
    <div className="sr-only">
      <h2>Cube attributions</h2>
      <ul>
        {cubeFaces.map((f) => (
          <li key={f.id}>
            {f.id} face: {cardBySlug[f.cardSlug]?.name}
          </li>
        ))}
        {cubeEdges.map((e) => (
          <li key={e.id}>
            {e.id} edge: {cardBySlug[e.cardSlug]?.name}, flowing {e.flow}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CubeOfSpaceClient() {
  const [flow, setFlow] = useState(false)
  return (
    <article className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeading truncate>Cube of Space</PageHeading>
        <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
          <FlowToggle pressed={flow} onPressedChange={setFlow} />
          <Button
            href="/cube-of-space/expand"
            onClick={enterPlayerFullscreen}
            color="emerald"
            className={toolbarButtonSize}
          >
            Expand ⤢
          </Button>
        </div>
      </div>
      <div
        className="h-[calc(100svh-12rem)] w-full"
        role="img"
        aria-label="Interactive 3D Cube of Space — drag to look around from inside the cube. Attributions are listed below for screen readers."
      >
        {/* Local boundary: keeps the texture load from suspending the whole
            route (which white-flashed the page on first visit). */}
        <Suspense fallback={null}>
          <CubeCanvas flow={flow} />
        </Suspense>
      </div>
      <CubeAttributionsSrOnly />
    </article>
  )
}
