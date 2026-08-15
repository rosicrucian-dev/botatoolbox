'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { Suspense, useEffect, useState } from 'react'

import { CubeCanvas } from '@/components/CubeCanvas'
import { FlowToggle } from '@/components/FlowToggle'
import { PlayerHeader } from '@/components/PlayerHeader'
import { useT } from '@/content/messages/useT'
import type { CubeSceneData } from '@/lib/cubeScene'
import { usePlayerFullscreenExit } from '@/lib/playerFullscreen'
import { usePlayerScrollLock } from '@/lib/usePlayerScrollLock'
import { useWakeLock } from '@/lib/useWakeLock'

export function CubeExpandClient({ scene }: { scene: CubeSceneData }) {
  const { t } = useT()
  const router = useLocaleRouter()
  const [flow, setFlow] = useState(false)

  // Contemplation view — keep the screen on while it's up.
  useWakeLock()

  // Match SlidePlayer's iOS chrome trick: render BLACK on first paint so
  // iOS Safari samples black for the toolbar tint, then mark `data-primed`
  // after two RAFs to release the override (CSS rule in tailwind.css).
  // Desktop never sees the override.
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

  // iOS standalone PWA bugfix: pre-paint scroll reset + hard body lock
  // so this full-screen `fixed` overlay isn't offset by the prior
  // page's scroll position. Full diagnosis lives with the hook.
  usePlayerScrollLock()

  // If the entry tap put us in true fullscreen, leave it on close.
  usePlayerFullscreenExit()

  // Esc closes (matching every other player's contract).
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
      if (e.key === 'Escape') router.push('/cube-of-space')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  return (
    <div
      data-primed={primed ? '' : undefined}
      className="player-shell fixed inset-x-0 top-0 z-50 flex flex-col bg-black text-white"
      style={{
        height: '100svh',
        paddingTop:
          'calc(env(safe-area-inset-top) + var(--player-top-breather, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <PlayerHeader
        title={t('player.cube.title')}
        onClose={() => router.push('/cube-of-space')}
        extraHeaderItem={
          <FlowToggle pressed={flow} onPressedChange={setFlow} />
        }
      />
      <div className="flex-1">
        <Suspense fallback={null}>
          <CubeCanvas flow={flow} scene={scene} />
        </Suspense>
      </div>
    </div>
  )
}
