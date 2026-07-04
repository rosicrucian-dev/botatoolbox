'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { useColorPalette } from '@/lib/colorPalette'
import { decodeSettingsToken } from '@/lib/settingsLink'
import { useTarotStyle } from '@/lib/tarotStyle'
import { applyRestoredUnlock } from '@/lib/useSecretMode'

// Silent applier for settings permalinks (?restore=<token>, encoded by
// src/lib/settingsLink.ts, generated on the Settings page). Mounted
// once in providers.tsx, so a permalink works no matter which page it
// points at.
//
// Opening a permalink applies its snapshot immediately — no
// confirmation. The user can change settings freely afterward; opening
// the bookmark again reverts to the snapshot, which is exactly what a
// settings-carrying bookmark is expected to do. Invalid tokens (a
// stale format from an older site version) are ignored. Either way the
// param is stripped from the URL afterward, so the snapshot doesn't
// linger in the session or re-apply while browsing.
function Restore() {
  const searchParams = useSearchParams()
  const token = searchParams.get('restore')
  const { setMajorStyle, setMinorStyle } = useTarotStyle()
  const { setColorPalette } = useColorPalette()

  useEffect(() => {
    if (!token) return
    const snapshot = decodeSettingsToken(token)
    if (snapshot) {
      setMajorStyle(snapshot.majorStyle)
      setMinorStyle(snapshot.minorStyle)
      setColorPalette(snapshot.colorPalette)
      // Only ever unlocks — a snapshot taken while locked simply
      // doesn't carry the unlock.
      if (snapshot.unlocked) applyRestoredUnlock()
    }
    const url = new URL(window.location.href)
    url.searchParams.delete('restore')
    window.history.replaceState(null, '', url.toString())
  }, [token, setMajorStyle, setMinorStyle, setColorPalette])

  return null
}

// useSearchParams requires a Suspense boundary in the static export —
// owned here so the caller can't forget it.
export function PermalinkRestore() {
  return (
    <Suspense>
      <Restore />
    </Suspense>
  )
}
