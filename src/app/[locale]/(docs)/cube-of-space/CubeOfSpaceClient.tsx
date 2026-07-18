'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'

import { Button } from '@/components/catalyst/button'
import { FlowToggle } from '@/components/FlowToggle'
import { PageHeading } from '@/components/PageHeading'
import { toolbarButtonSize } from '@/components/toolbarButton'
import type { CubeAttributions, CubeSceneData } from '@/lib/cubeScene'
import { enterPlayerFullscreen } from '@/lib/playerFullscreen'

// three.js + react-three-fiber are by far the heaviest imports on this
// route — load them on demand so the page shell paints without them.
// (The expand player keeps a static import; it IS the cube.)
const CubeCanvas = dynamic(
  () => import('@/components/CubeCanvas').then((m) => m.CubeCanvas),
  { ssr: false },
)

// The cube's attributions, as text, for screen readers — the WebGL canvas
// is invisible to AT and this is real content (which card sits on each
// face and edge). Zero visual footprint.
function CubeAttributionsSrOnly({
  attributions,
}: {
  attributions: CubeAttributions
}) {
  return (
    <div className="sr-only">
      <h2>Cube attributions</h2>
      <ul>
        {attributions.faces.map((f) => (
          <li key={f.id}>
            {f.id} face: {f.cardName}
          </li>
        ))}
        {attributions.edges.map((e) => (
          <li key={e.id}>
            {e.id} edge: {e.cardName}, flowing {e.flow}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CubeOfSpaceClient({
  scene,
  attributions,
}: {
  scene: CubeSceneData
  attributions: CubeAttributions
}) {
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
          <CubeCanvas flow={flow} scene={scene} />
        </Suspense>
      </div>
      <CubeAttributionsSrOnly attributions={attributions} />
    </article>
  )
}
