'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CubeCanvas } from '@/components/CubeCanvas'
import { FlowToggle } from '@/components/FlowToggle'
import { PlayerHeader } from '@/components/PlayerHeader'

export default function CubeOfSpaceExpandPage() {
  const router = useRouter()
  const [flow, setFlow] = useState(false)

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
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <PlayerHeader
        title="Cube of Space"
        onClose={() => router.push('/cube-of-space')}
        extraHeaderItem={
          <FlowToggle pressed={flow} onPressedChange={setFlow} />
        }
      />
      <div className="flex-1">
        <CubeCanvas flow={flow} />
      </div>
    </div>
  )
}
