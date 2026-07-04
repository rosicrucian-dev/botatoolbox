'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { FlowToggle } from '@/components/FlowToggle'
import { PlayerHeader } from '@/components/PlayerHeader'
import { Tab, Tabs } from '@/components/Tabs'
import { TreeOfLifeSvg, type FlowDirection } from '@/components/TreeOfLifeSvg'
import { usePlayerFullscreenExit } from '@/lib/playerFullscreen'
import { usePlayerScrollLock } from '@/lib/usePlayerScrollLock'
import { useWakeLock } from '@/lib/useWakeLock'

export default function TreeOfLifeExpandPage() {
  const router = useRouter()
  const [flow, setFlow] = useState(false)
  const [direction, setDirection] = useState<FlowDirection>('descend')

  // Contemplation view — keep the screen on while it's up.
  useWakeLock()

  // iOS standalone PWA bugfix: pre-paint scroll reset + hard body lock
  // so this full-screen `fixed` overlay isn't offset by the prior
  // page's scroll position. Full diagnosis lives with the hook. (The
  // tree's own inner overflow-y-auto scroller is unaffected.)
  usePlayerScrollLock()

  // If the entry tap put us in true fullscreen, leave it on close.
  usePlayerFullscreenExit()

  // iOS chrome trick: render BLACK on first paint so iOS Safari samples
  // black for the toolbar tint, then mark `data-primed` after two RAFs to
  // release the override (CSS rule in tailwind.css). Desktop never sees it.
  const [primed, setPrimed] = useState(false)
  useEffect(() => {
    let raf2: number | undefined
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPrimed(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  // Esc closes — same contract as the SlidePlayer / Cube expand.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      )
        return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (e.key === 'Escape') router.push('/tree-of-life')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  return (
    <div
      data-primed={primed ? '' : undefined}
      className="player-shell fixed inset-x-0 top-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
      style={{
        height: '100svh',
        paddingTop: 'calc(env(safe-area-inset-top) + var(--player-top-breather, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <PlayerHeader
        title="Tree of Life"
        onClose={() => router.push('/tree-of-life')}
        extraHeaderItem={
          <>
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
          </>
        }
      />
      {/* Tree fills the area below the header. SVG width:height aspect is
          400:680 (~0.59), so at full container width on a wide screen the
          rendered height exceeds the viewport — overflow-y-auto lets the
          user scroll. Tiny horizontal padding so the tree doesn't kiss the
          edges. */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 sm:px-4">
        <TreeOfLifeSvg
          className="mx-auto block w-full"
          flow={flow}
          flowDirection={direction}
        />
      </div>
    </div>
  )
}
